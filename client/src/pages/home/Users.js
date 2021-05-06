import React from 'react'
import { useQuery } from "@apollo/client";
import { Col, Image } from "react-bootstrap";
import { GET_USERS } from '../../graphql/users';
import { useMessageDispatch, useMessageState } from "../../context/states";


export default function Users() {
  const dispatch = useMessageDispatch();
  const { users, selectedChat } = useMessageState();

  const { loading,data: usersData } = useQuery(GET_USERS, {
    onCompleted: (data) => {
      dispatch({ type: "SET_USERS", payload: data.getUsers })
    },
    onError: (err) => console.log(err),
  });

  let usersMarkup;
  if (!usersData || loading) {
    usersMarkup = <p>Loading...</p>;
  } else if (usersData.getUsers.length === 0) {
      usersMarkup = <p className="p-2">Yor're the fisrt user!</p>;
  } else if (usersData.getUsers.length > 0) {
    usersMarkup = usersData.getUsers.map((user) => {
      return (
        <div
          role="button"
          key={user.username}
          className={`d-flex p-3 user-div justify-content-center justify-content-md-start ${
            selectedChat?.chatType === "private" &&
            user.id === selectedChat.user.id
              ? "bg-white"
              : " "
          }`}
          onClick={() =>
            dispatch({
              type: "SET_SELECTED_CHAT",
              payload: { user, chatType: "private" },
            })
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
                `${user.latestMessage.content}`
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
    <Col className="px-0">
      {usersMarkup}
    </Col>
  );
}
