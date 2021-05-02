import React, { Fragment, useState } from "react";
import { Row, Col, Button, Tab, Tabs, TabContainer, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAtuhState } from '../../context/auth';
import {  useMessageState } from "../../context/states";

import { useAtuhDispatch } from "../../context/auth";


//components
import Users from './Users';
import Messages from './Messages';
import Groups from "../groups/Groups";


export default function Home() {
  const { username } = useAtuhState();
  const { users } = useMessageState();
  const [key, setKey] = useState("chat");
  const authDispatch = useAtuhDispatch();


  const user = users?.filter((u) => u.username === username)

  const logout = () => {
    authDispatch({ type: 'LOGOUT' });
    window.location.href = '/login';
  };
  
  return (
    <Fragment>
      <Row className="justify-content-around bg-light">
        {username && (
          <div className="col user-div">
          <Image
            src={
              user?.imageUrl ||
              "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"
            }
            roundedCircle
            className="mr-2 user-pic"
          />
            <div className="d-inline ml-2">
              <small className="text-success m-0">{username}</small>
          </div>
          </div>
        )}
        {!username && (
          <>
            <Link to="/login">
              <Button variant="link">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="link">Register</Button>
            </Link>
          </>
        )}
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
