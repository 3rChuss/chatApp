import React, { useEffect, useState, Fragment } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useLazyQuery, useMutation } from "@apollo/client";
import { useSubscription } from '@apollo/client';

import { useMessageState, useMessageDispatch } from "../../context/states";
import { useAtuhState } from '../../context/auth';
import {
  GET_PRIVATE_MESSAGES,
  SEND_PRIVATE_MESG,
} from "../../graphql/messages";
import { 
  GET_GROUP_MSGS,
  GET_GROUPS,
  SEND_GROUP_MSG } from "../../graphql/groups";
import { NEW_MESSAGE } from "../../graphql/subscriptions";



import Message from './Message';


export default function Messages() {
  const messageDispatch = useMessageDispatch();
  const { selectedChat } = useMessageState();
  const { userId } = useAtuhState
  const [content, setContent] = useState("");

  const [ getPrivateMessages,
    { loading: messagesLoading, data: privateMessagesData },
  ] = useLazyQuery(GET_PRIVATE_MESSAGES, { onError: (err) => console.log(err), });

  const [ getGroupMessages,
    { data: groupData, loading: groupMessagesLoading },
  ] = useLazyQuery(GET_GROUP_MSGS, { onError: (err) => console.log(err), });

  const [sendPrivateMsg, 
    { loading: loadingPrivateMsg }
  ] = useMutation(SEND_PRIVATE_MESG, { onError: (err) => console.log(err), });

  const [sendGroupMsg, 
    { loading: loadingGroupMsg }
    ] = useMutation(SEND_GROUP_MSG, { onError: (err) => console.log(err), });


  //Get new message and s
  const { error: subscriptionError, data: newMessageData } = useSubscription(NEW_MESSAGE)
  useEffect(() => {
    if (subscriptionError) {
      console.log(subscriptionError)
    }
  }, [subscriptionError]);


  //Get all messages and show
  useEffect(() => {
    if (!selectedChat) return;
    if (selectedChat && selectedChat.chatType === "private") {
      getPrivateMessages({ variables: { userId: selectedChat.user.id } });
    } else if (selectedChat && selectedChat.chatType === "group") {
      getGroupMessages({
        variables: { conversationId: selectedChat.group.id },
      });
    }
  }, [selectedChat]);



  //Submit new messages
  const submitMessage = (e) => {
    e.preventDefault();
    if (content.trim() === "") return;

    if (selectedChat.chatType === "private") {
      sendPrivateMsg({ variables: { receiverId: selectedChat.user.id, content } });
    } else if (selectedChat.chatType === "group") {
      sendGroupMsg({
        variables: { conversationId: selectedChat.group.id, content },
      });
    }
    setContent("");
  };
  
  //For private messages
  let selectedChatMarkup;
  if (!privateMessagesData && !groupData) {
    selectedChatMarkup = <small className="info-text">Select a chat</small>;
  } else if (messagesLoading) {
    selectedChatMarkup = <small className="info-text">Loading...</small>;
  } else if (privateMessagesData) {
    if (privateMessagesData.getPrivateMessages.length > 0) {
      selectedChatMarkup = privateMessagesData.getPrivateMessages.map((message, index) => (
        <Fragment key={index}>
          <Message key={message.id} message={message} />
          {index === privateMessagesData.getPrivateMessages.length - 1 && (
            <div className="invisible">
              <hr className="m-0" />
            </div>
          )}
        </Fragment>
      ));
    } else if (privateMessagesData.getPrivateMessages.length === 0) {
      selectedChatMarkup = <small className="info-text"> Connected! start sending messages!</small>;
    }
  } else if (groupData) {
    if (groupData.getGroupMessages.length > 0) {
      selectedChatMarkup = groupData.getGroupMessages.map((message, index) => (
        <Fragment key={index}>
          <Message key={message.id} message={message} />
          {index === groupData.getGroupMessages.length - 1 && (
            <div className="invisible">
              <hr className="m-0" />
            </div>
          )}
        </Fragment>
      ));
    } else if (groupData.getGroupMessages.length === 0) {
      selectedChatMarkup = <small className="info-text">Connected! start sending messages!</small>
    }
  }

  return (
    <Col xs={9} sm={8} className="pl-0">
      <div className="p-3 bg-white messages-box d-flex flex-column-reverse">
        {selectedChatMarkup}
      </div>
      <div>
        <Form onSubmit={submitMessage}>
          <Form.Group className="d-flex">
            <Form.Control
              type="text"
              className="rounded-pill bg-white mt-3"
              placeholder="Type a message..."
              value={content}
              onChange={(e) =>
                selectedChat ? setContent(e.target.value) : null
              }
            />
            <button
              className="mt-3 btn rounded send-btn"
              onClick={submitMessage}
            >
              {"🚀"}
            </button>
          </Form.Group>
        </Form>
      </div>
    </Col>
  );
}
