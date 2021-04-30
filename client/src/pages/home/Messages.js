import React, { useEffect, useState } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useLazyQuery, useMutation } from "@apollo/client";
import { useMessageDispatch, useMessageState } from "../../context/states";
import { GET_PRIVATE_MESSAGES, SEND_MESSAGE } from "../../graphql/messages";

import Message from './Message';
import { Fragment } from 'react';


export default function Messages() {
  const dispatch = useMessageDispatch();
  const { users, groups } = useMessageState();
  const [content, setContent] = useState('');


  const selectedUser = users?.find(u => u.selected === true);
  const selectedGroup = groups?.find(g => g.selected === true);
  const groupMessages = selectedGroup?.messages;
  const messages = selectedUser?.messages;

  const [
    getPrivateMessages,
    { loading: messagesLoading, data: messagesData },
  ] = useLazyQuery(GET_PRIVATE_MESSAGES);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: (err) => console.log(err),
  });

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getPrivateMessages({ variables: { userId: selectedUser.id } });
    }
  }, [selectedUser]);

  const submitMessage = e => {
    e.preventDefault();
    if (content === "") return
    // mutation for sending messages
    sendMessage({ variables: { to: selectedUser.username, type: 'private', content } });
    setContent("");
  }


  useEffect(() => {
    if (messagesData) {
      dispatch({
        type: "SET_USER_MESSAGES",
        payload: {
          username: selectedUser.username,
          messages: messagesData.getMessages,
        },
      });
    }
  }, [messagesData])

  let selectedChatMarkup;
  if (!messages && !messagesLoading) {
    selectedChatMarkup = <small className="info-text">Select a friend</small>;
  } else if (messagesLoading) {
    selectedChatMarkup = <small className="info-text">Loading..</small>;
  } else if (messages.length > 0) {
    selectedChatMarkup = messages.map((message, index) => (
      <Fragment key={index}>
        <Message key={message.id} message={message} />
        {index === messages.length - 1 &&
          (<div className="invisible"><hr className="m-0" /></div>)
        }
      </Fragment>
    ));
  } else if (messages.length === 0) {
    selectedChatMarkup = (
      <small className="info-text">Connected! start sending messages!</small>
    );
  }

  return (
    <Col xs={9} sm={8}>
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
                selectedUser ? setContent(e.target.value) : null
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
