import React from 'react'
import { gql, useQuery } from "@apollo/client";
import { Col, Image } from "react-bootstrap";

import { useMessageDispatch, useMessageState } from "../../context/message";

const GET_USERS = gql`
  query getUsers {
    getUsers {
      username
      createdAt
      imageUrl
      latestMessage {
        uuid
        from
        to
        content
        createdAt
      }
    }
  }
`;

export default function Users() {
  const dispatch = useMessageDispatch();
  const { users } = useMessageState();
  const selectedUser = users?.find((u) => u.selected === true)?.username;

  const { loading } = useQuery(GET_USERS, {
    onCompleted: (data) =>
      dispatch({ type: "SET_USERS", payload: data.getUsers }),
    onError: (err) => console.log(err),
  });

  let usersMarkup;
  if (!users || loading) {
    usersMarkup = <p>Loading...</p>;
  } else if (users.length === 0) {
    usersMarkup = <p>Not users have joined</p>;
  } else if (users.length > 0) {
    usersMarkup = users.map((user) => {
      return (
        <div
          role="button"
          key={user.username}
          className={`d-flex p-3 user-div justify-content-center justify-content-md-start ${
            selectedUser === user.username ? "bg-white" : " "
          }`}
          onClick={() =>
            dispatch({ type: "SET_SELECTED_USER", payload: user.username })
          }
        >
          <Image
            src={
              user.imageUrl ||
              "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"
            }
            roundedCircle
            className="mr-2 user-pic"
          />
          <div className="d-none d-md-block ml-2">
            <p className="text-success m-0">{user.username}</p>
            <small>
              {user.latestMessage ? (
                user.latestMessage.content
              ) : (
                <p>Click to send a message</p>
              )}
            </small>
          </div>
        </div>
      );
    });
  }

  return (
    <Col xs={2} md={4} className="px-0">
      {usersMarkup}
    </Col>
  );
}
