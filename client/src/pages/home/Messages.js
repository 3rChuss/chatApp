import React, { useEffect, useState } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useLazyQuery, useMutation } from "@apollo/client";
import { useMessageDispatch, useMessageState } from "../../context/states";
import {
  GET_PRIVATE_MESSAGES,
  SEND_PRIVATE_MESG,
} from "../../graphql/messages";

import { GET_GROUP_MSGS, SEND_GROUP_MSG } from "../../graphql/groups";

import Message from './Message';
import { Fragment } from 'react';


export default function Messages() {
  const dispatch = useMessageDispatch();
  const { selectedChat } = useMessageState();
  const [content, setContent] = useState("");

  const [
    getPrivateMessages,
    { loading: messagesLoading, data: messagesData },
  ] = useLazyQuery(GET_PRIVATE_MESSAGES, { onError: (err) => console.log(err), });

  const [
    getGroupMessages,
    { data: groupData, loading: groupMessagesLoading },
  ] = useLazyQuery(GET_GROUP_MSGS, { onError: (err) => console.log(err), });

  const [sendPrivateMsg, { loading: loadingPrivateMsg }] = useMutation(
    SEND_PRIVATE_MESG, { onError: (err) => console.log(err), });

  const [sendGroupMsg, { loading: loadingGroupMsg }] = useMutation(
    SEND_GROUP_MSG, { onError: (err) => console.log(err), });

  //Get messages when new chat is selected and if there is new data coming
  useEffect(() => {
    if (!selectedChat) return;
    if (selectedChat && selectedChat.chatType === "private") {
      getPrivateMessages({ variables: { userId: selectedChat.user.id } });
    } else if (selectedChat && selectedChat.chatType === "group") {
      getGroupMessages({
        variables: { conversationId: selectedChat.group.id },
      });
    }
  }, [selectedChat, messagesData, groupData]);


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
  if (!messagesData && !groupData) {
    selectedChatMarkup = <small className="info-text">Select a chat</small>;
  } else if (messagesLoading) {
    selectedChatMarkup = <small className="info-text">Loading...</small>;
  } else if (messagesData) {
    if (messagesData.getPrivateMessages.length > 0) {
      selectedChatMarkup = messagesData.getPrivateMessages.map((message, index) => (
        <Fragment key={index}>
          <Message key={message.id} message={message} />
          {index === messagesData.getPrivateMessages.length - 1 && (
            <div className="invisible">
              <hr className="m-0" />
            </div>
          )}
        </Fragment>
      ));
    } else if (messagesData.getPrivateMessages.length === 0) {
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
