import React, { useEffect, useState, Fragment } from 'react';
import { Col } from 'react-bootstrap';
import { useLazyQuery } from "@apollo/client";
import { useSubscription } from '@apollo/client';

import { useMessageState } from "../../context/states";
import { useAtuhState } from '../../context/auth';
import {
  GET_PRIVATE_MESSAGES } from "../../graphql/messages";
import { 
  GET_GROUP_MSGS,
  GET_GROUPS
 } from "../../graphql/groups";
import { GET_USERS } from '../../graphql/users';
import { NEW_MESSAGE } from "../../graphql/subscriptions";

import Message from './Message';
import SendMessage from './SendMessage'

export default function Messages() {
  const { selectedChat } = useMessageState();
  const { userId } = useAtuhState();
  const [messages, setMessages] = useState("");

  const [ getPrivateMessages,
    { loading: messagesLoading, data: privateMessagesData },
  ] = useLazyQuery(GET_PRIVATE_MESSAGES, { onError: (err) => console.log(err), });
  const [ getGroupMessages,
    { data: groupData, loading: groupMessagesLoading },
  ] = useLazyQuery(GET_GROUP_MSGS, { onError: (err) => console.log(err), });

  //Get new messages from subscriptions
   const { error: subscriptionError } = useSubscription(NEW_MESSAGE, {
    onSubscriptionData:({client, subscriptionData}) => {
      const newMessage = subscriptionData.data.newMessage;
      let getMsgQuery,
        getMsgVariables,
        getMsgQueryName,
        getLastMsgQuery,
        getLastMsgQueryName,
        lastMsgTargetId;

       if (newMessage.type === 'private'){
         const otherUserId = newMessage.participants.filter((p) => p !== userId)[0];
         getMsgQuery = GET_PRIVATE_MESSAGES;
         getMsgVariables = {userId: otherUserId};
         getMsgQueryName = 'getPrivateMessages';
         getLastMsgQuery = GET_USERS;
         getLastMsgQueryName = 'getUsers';
         lastMsgTargetId = otherUserId;
       
       } else if ( newMessage.type === 'group') {
        const groupConversationId = newMessage.message.conversationId;
        getMsgQuery = GET_GROUP_MSGS;
        getMsgVariables = { conversationId: groupConversationId };
        getMsgQueryName = 'getGroupMessages';
        getLastMsgQuery = GET_GROUPS;
        getLastMsgQueryName = 'getGroups';
        lastMsgTargetId = groupConversationId;
       }

       const conversationCache = client.readQuery({
         query: getMsgQuery,
         variables: getMsgVariables
       });

       if(conversationCache){
         const updatedConvoCache = [
           ...conversationCache[getMsgQueryName],
           newMessage.message
         ];
         client.writeQuery({
           query: getMsgQuery,
           variables: getMsgVariables,
           data: {
             [getMsgQueryName]: updatedConvoCache
           }
         })
       };

       const lastMsgCache = client.readQuery({
         query: getLastMsgQuery
       });


       if (lastMsgCache){
         const updatedLastMsgCache = 
          lastMsgCache[getLastMsgQueryName].map((l) =>
            l.id === lastMsgTargetId
              ? { ...l, latestMessage: newMessage.message }
              : l
          );


          client.writeQuery({
            query: getLastMsgQuery, 
            data: {
              [getLastMsgQueryName]: updatedLastMsgCache,
            },
          });
       }
    },
    onError:(err) => console.log(err),
  });

  useEffect(() => {
    if (subscriptionError) {
      console.log(subscriptionError)
    }
  }, [subscriptionError]);


  //Set messages from database at the begining
  useEffect(() => {
    if (!selectedChat) return;
    if (selectedChat.chatType === "private") {
      getPrivateMessages({ variables: { userId: selectedChat.user.id } });
    } else if (selectedChat.chatType === "group") {
      getGroupMessages({ varialbes: {conversationId: selectedChat.group.id}});
    }
  }, [selectedChat]);

  //Set new messages from subscription
  useEffect(() => {
    if (!selectedChat) return;
    if (privateMessagesData && selectedChat.chatType === "private") {
      setMessages(privateMessagesData.getPrivateMessages)
    } else if (groupData && selectedChat.chatType === "group") {
      setMessages(groupData.getGroupMessages)
    }
  }, [selectedChat, privateMessagesData, groupData]);

  
  //For private messages
  let selectedChatMarkup;
  if (!selectedChat) {
    selectedChatMarkup = <small className="info-text">Select a chat</small>;
  } else if (messagesLoading || groupMessagesLoading) {
    selectedChatMarkup = <small className="info-text">loading messages...</small>;
  } else if (messages) {
    if (messages.length > 0) {
      selectedChatMarkup = messages.map((message, index) => (
        <Fragment key={index}>
          <Message message={message} />
          {index === message.length - 1 && (
            <div className="invisible">
              <hr className="m-0" />
            </div>
          )}
        </Fragment>
      ));
    } else if (messages.length === 0) {
      selectedChatMarkup = <small className="info-text"> Connected! start sending messages!</small>;
    }
  }

  return (
    <Col xs={9} sm={8} className="pl-0">
      <div className="p-3 bg-white messages-box d-flex flex-column-reverse">
        {selectedChatMarkup}
      </div>
      <div>
        <SendMessage />
      </div>
    </Col>
  );
}
