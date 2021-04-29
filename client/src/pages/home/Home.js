import React, { Fragment, useEffect, useState } from "react";
import { Row, Col, Button, Tab, Tabs, TabContainer } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { gql, useSubscription } from '@apollo/client';

import { useAtuhDispatch, useAtuhState } from "../../context/auth";
import { useMessageDispatch } from "../../context/message";

//components
import Users from './Users';
import Messages from './Messages';
import Groups from "./Groups";

const NEW_MESSAGE = gql`
  subscription newMessage{
    newMessage{
      uuid
      from to content createdAt
    }
  }
`;


export default function Home({ history }) {

  const [key, setKey] = useState("chat");
  const authDispatch = useAtuhDispatch();
  const messageDispatch = useMessageDispatch();
  const { user } = useAtuhState();

  const { data: messageData, error: messageError } = useSubscription(NEW_MESSAGE);

  useEffect(() => {
    if (messageError) console.log(messageError);

    if (messageData) {
      const message = messageData.newMessage;
      const otherUser = user === message.to ? message.from : message.to;

      messageDispatch({
        type: "ADD_MESSAGE",
        payload: {
          username: otherUser,
          message
        },
      })
    };

  }, [messageError, messageData])

  const logout = () => {
    authDispatch({ type: 'LOGOUT' });
    window.location.href = '/login';
  };
  
  return (
    <Fragment>
      <Row className="justify-content-around bg-light">
        <Link to="/login">
          <Button variant="link">Login</Button>
        </Link>
        <Link to="/register">
          <Button variant="link">Register</Button>
        </Link>
        <Button variant="link" onClick={logout}>
          Logout
        </Button>
      </Row>
      <Row className="bg-light pt-5 mt-2">
        <Col xs={3} sm={4}>
          <TabContainer>
            <Tabs
              defaultActiveKey="chat"
              activeKey={key}
              onSelect={(k) => setKey(k)}
            >
              <Tab eventKey="chat" title="Chat">
                <Users />
              </Tab>
              <Tab eventKey="groups" title="Groups">
                <Groups />
              </Tab>
            </Tabs>
          </TabContainer>
        </Col>
        <Messages />
      </Row>
    </Fragment>
  );
}
