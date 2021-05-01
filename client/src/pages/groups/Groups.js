import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Button, Card, Col } from "react-bootstrap";

import { GET_GROUPS } from '../../graphql/groups';

import { useMessageDispatch, useMessageState } from "../../context/states";





export default function Groups() {
    
    const dispatch = useMessageDispatch();
    const { selectedChat } = useMessageState();

    
    const { data: groupData, loading } = useQuery(GET_GROUPS, {
        onError: (err) => console.log(err),
    });
  
    let usersMarkup;
    if (!groupData || loading) {
      usersMarkup = <p>Loading...</p>;
    } else if (groupData.getGroups.length === 0) {
      usersMarkup = <p>Not users have joined</p>;
    } else if (groupData.getGroups.length > 0) {
      usersMarkup = groupData.getGroups.map((group) => {
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
              className={`my-2 bg-light user-div 
                        ${selectedChat?.chatType === 'group' && selectedChat.group?.id === group.id ? "bg-white" : " "}`}
            >
              <Card.Body className="text-success m-0 p-2">
                <div className="d-block">
                  <a role="button" className="dark float-right">
                    {"👁‍🗨"}
                  </a>
                  {group.name}
                </div>
                <small className="d-block">
                  {group.latestMessage &&
                  group.latestMessage.to === group.admin ? (
                    `${group.latestMessage.content} < you`
                  ) : group.latestMessage &&
                    group.latestMessage.to !== group.admin ? (
                    `${group.latestMessage.content} < ${group.latestMessage.to}`
                  ) : (
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
        {usersMarkup}
        <Button>
          Add Group
        </Button>
      </Col>
    );
}
