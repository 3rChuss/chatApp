import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Button, Card, Col, Modal, Form } from "react-bootstrap";

import { useMessageDispatch, useMessageState } from "../../context/states";

const GET_GROUPS = gql`
  query getGroups {
    getGroups {
      id
      name
      participants
      latestMessage {
        id
        content
      }
    }
  }
`;



export default function Groups() {
    
    const dispatch = useMessageDispatch();
    const { users, groups } = useMessageState();
  const selectedGroup = groups?.find((u) => u.selected === true);

  const usersInGroup = groups?.map(u => u.participants);

    
    const { loading } = useQuery(GET_GROUPS, {
        onCompleted: (data) =>
            dispatch({ type: "SET_GROUPS", payload: data.getGroups }),
        onError: (err) => console.log(err),
    });

    let usersMarkup;
    if (!groups || loading) {
        usersMarkup = <p>Loading...</p>;
    } else if (groups.length === 0) {
        usersMarkup = <p>Not users have joined</p>;
    } else if (groups.length > 0) {
        usersMarkup = groups.map((group) => {
            return (
              <div
                role="button"
                key={group.id}
                onClick={() =>
                  dispatch({ type: "SET_SELECTED_GROUP", payload: group.id })
                }
              >
                <Card
                  className={`my-2 bg-light user-div 
                        ${selectedGroup?.id === group.id ? "bg-white" : " "}`}
                >
                  <Card.Body className="text-success m-0 p-2">
                    <div className="d-block">
                      <a
                        role="button"
                        className="dark float-right"
                      >
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
