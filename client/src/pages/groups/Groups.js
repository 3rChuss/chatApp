import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Button, Card, Col } from "react-bootstrap";

import { GET_GROUPS } from '../../graphql/groups';

import { useMessageDispatch, useMessageState } from "../../context/states";
import CreateGroup from './CreateGroup';
import GroupInfo from './GroupInfo';

export default function Groups() {
    
    const dispatch = useMessageDispatch();
    const { selectedChat } = useMessageState();
    const [showNewGroup,setShowNewGroup] = useState(false);
    const [showDetailsGroup, setShowDetailsGroup] = useState(false);
    const [errors, setErrors] = useState({});


    const closeModalNewgroup = () => setShowNewGroup(!showNewGroup);
    const closeModalDetails = () => setShowDetailsGroup(!showDetailsGroup);
    
    const { data: groupData, loading } = useQuery(GET_GROUPS, {
        onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
    });
  
    let groupsMarkUp;
    if (!groupData || loading) {
      groupsMarkUp = <p>Loading...</p>;
    } else if (groupData.getGroups.length === 0) {
      groupsMarkUp = <p className="p-2">Start creating a new group</p>;
    } else if (groupData.getGroups.length > 0) {
      groupsMarkUp = groupData.getGroups.map((group) => {
        return (
          <div
            role="button"
            key={group.id}
            onClick={() =>
              dispatch({
                type: "SET_SELECTED_CHAT",
                payload: { group, chatType: "group" },
              })
            }
          >
            <Card
              className={`bg-light user-div border-0
                        ${selectedChat?.chatType === 'group' && selectedChat?.group.id === group.id ? "bg-white" : " "}`}
            >
              <Card.Body className="m-0 border-0">
                <div className="d-block ">
                  <a role="button" className="dark float-right" onClick={closeModalDetails}>
                    {"🕵️‍♀️"}
                  </a>
                  {group.name}
                </div>
                <small className="d-block">
                  {group.latestMessage && (
                    group.latestMessage.content
                  )}
                  {!group.latestMessage && (
                    <p>Click to send a message</p>
                  )}
                </small>
              </Card.Body>
            </Card>
          </div>
        );
      });
    }


    return (
      <Col className="px-0">
        {groupsMarkUp}
        <Col className="px-0">
          <Button className="w-100 btn-sm btn-outline-dark" variant="light" onClick={closeModalNewgroup}>
            ➕ New Group
          </Button>
        </Col>
        {showNewGroup && (
          <CreateGroup showNewGroup={showNewGroup} closeModalNewgroup={closeModalNewgroup} />
        )}
        {showDetailsGroup && (
          <GroupInfo showDetailsGroup={showDetailsGroup} closeModalDetails={closeModalDetails} />
        )}
      </Col>
    );
}
