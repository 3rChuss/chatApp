import React, { Fragment, useState } from "react";
import { Row, Col, Button, Tab, Tabs, TabContainer } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {  useSubscription } from '@apollo/client';

import { useAtuhDispatch } from "../../context/auth";
import { NEW_MESSAGE } from "../../graphql/subscriptions";

//components
import Users from './Users';
import Messages from './Messages';
import Groups from "../groups/Groups";


export default function Home() {

  const [key, setKey] = useState("chat");
  const authDispatch = useAtuhDispatch();


  console.log(useSubscription(NEW_MESSAGE));


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
        <Col xs={3} sm={4} className="p-0">
          <TabContainer>
            <Tabs
              transition={false}
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
