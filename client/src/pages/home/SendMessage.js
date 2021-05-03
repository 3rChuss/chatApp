import React, {useState} from 'react';
import { useMutation } from "@apollo/client";
import { Form } from 'react-bootstrap';
import { useMessageState } from "../../context/states";
import { SEND_GROUP_MSG } from "../../graphql/groups";
import { SEND_PRIVATE_MESG } from "../../graphql/messages";

export default function SendMessage() {

     const [content, setContent] = useState("");
     const { selectedChat } = useMessageState();
     const [sendPrivateMsg,{ loading: loadingPrivateMsg }] = useMutation(SEND_PRIVATE_MESG, { onError: (err) => console.log(err), });
     const [sendGroupMsg, { loading: loadingGroupMsg }] = useMutation(SEND_GROUP_MSG, { onError: (err) => console.log(err), });

     
     //Submit new messages
     const submitMessage = (e) => {
          e.preventDefault();
          if (content.trim() === "") return;
          if (selectedChat.chatType === "private") {
               sendPrivateMsg({ variables: { receiverId: selectedChat.user.id, content } });
          } else if (selectedChat.chatType === "group") {
               sendGroupMsg({
               variables: { conversationId: selectedChat.group.id, content },
               });
          }
          setContent("");
     };

     return (
          <Form onSubmit={submitMessage}>
          <Form.Group className="d-flex">
            <Form.Control
              type="text"
              className="rounded-pill bg-white mt-3"
              placeholder="Type a message..."
              value={content}
              onChange={(e) =>
                selectedChat ? setContent(e.target.value) : null
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
     )
}