import React, {useState} from 'react';
import {Modal, Button, Form} from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client';
import { GET_GROUPS, CREATE_GROUP } from "../../graphql/groups";
import { GET_USERS } from '../../graphql/users';
import { useMessageState, useMessageDispatch } from '../../context/states';

export default function CreateGorup({show, closeModal}){
     const { selectedChat } = useMessageState();
     const dispatch = useMessageDispatch();
     const [participants, setParticipants] = useState("");
     const [variables, setVariables] = useState({
          name: '',
          participants: []
     })
     const [showModal, setShowModal] = useState(false);


     const { data: userData} = useQuery(GET_USERS, {
          onError: (err) => console.log(err),
     });

     const [createNewGroup, {loading}] = useMutation(CREATE_GROUP, {
          onError: (err) => console.log(err)
     });

     const submitGroup = (e) => {
          e.preventDefault();
          createNewGroup({
               variables,
               update: (proxy, {data}) => {
                    const returnedData = data.createGroup;
                    const dataCache = proxy.readQuery({
                         query:GET_GROUPS
                    });

                    proxy.writeQuery({
                         query: GET_GROUPS,
                         data:{
                              getGroups:[...dataCache.getGroups, returnedData]
                         }
                    });
                    dispatch({
                         type: "SET_SELECTED_CHAT",
                         payload: { returnedData, chatType: "group" },
                    })
               }
          })
          closeModal();
     }

     return (
          <Modal show={show} animation={false} onHide={closeModal}>
               <Modal.Header closeButton>
                    <Modal.Title>Create a new group</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                    <Form onSubmit={submitGroup}>
                         <Form.Group>
                              <Form.Label>
                                  Group name
                              </Form.Label>
                              <Form.Control
                                   required
                                   type="text"
                                   value={variables.name}
                                   onChange={(e) =>
                                   setVariables({ ...variables, name: e.target.value })
                                   }
                              />
                         </Form.Group>
                         <Form.Group>
                              <Form.Label>
                                   Invite a friend either Phone nº or email
                              </Form.Label>
                              <Form.Control
                                   required
                                   type="text"
                                   value={variables.participants}
                                   onChange={(e) =>
                                   setVariables({ ...variables, participants: e.target.value })
                                   }
                              />
                         </Form.Group>
                    </Form>
               </Modal.Body>
               <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                         Close
                    </Button>
                    <Button variant="primary" onClick={submitGroup}>
                         Save Changes
                    </Button>
               </Modal.Footer>
          </Modal>
     );
}