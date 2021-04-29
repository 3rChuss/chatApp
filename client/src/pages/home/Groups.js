import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Button, Card, Col, Modal, Form } from "react-bootstrap";

import { useMessageDispatch, useMessageState } from "../../context/message";

const GET_GROUPS = gql`
  query getGroups {
    getGroups {
      id
      name
      participants
      latestMessage {
        uuid
        content
      }
    }
  }
`;



export default function Groups() {

  const [showDetails, setShowDetails] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const handleClose = () => {
    setShowDetails(false);
    setShowCreateGroup(false);
  }
    
    const dispatch = useMessageDispatch();
    const { users, groups } = useMessageState();
  const selectedGroup = groups?.find((u) => u.selected === true);

  const usersInGroup = groups?.map(u => u.participants);

    
    const { loading } = useQuery(GET_GROUPS, {
        onCompleted: (data) =>
            dispatch({ type: "SET_GROUPS", payload: data.getGroups }),
        onError: (err) => console.log(err),
    });

    const GroupDetails = () => {
        return (
          <Modal show={showDetails} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Time is ending :/</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              So hope, you can value it! just around 14:00 I found i was wrong
              with the program approach - schemas - 😢
              <br />
              Joined: {usersInGroup?.map((u) => u)}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Say Bye to Jesus
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Save Jesus
              </Button>
            </Modal.Footer>
          </Modal>
        );
    }


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
                        onClick={() => setShowDetails(!showDetails)}
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
        <GroupDetails />
        {usersMarkup}
        <Button>
          Add Group
        </Button>
      </Col>
    );
}
