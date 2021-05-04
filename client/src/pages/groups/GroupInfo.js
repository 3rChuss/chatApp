import React, {useState} from 'react';
import { useMutation } from "@apollo/client";
import { Modal, Button, Image, Form } from 'react-bootstrap';

import { useMessageState, useMessageDispatch } from "../../context/states";
import { GET_GROUPS, ADD_GROUP_USER } from '../../graphql/groups';


export default function GroupInfo({showDetailsGroup, closeModalDetails}){
     const dispatch = useMessageDispatch();
     const { users, selectedChat } = useMessageState();
     const {participants} = selectedChat.group;
          const [variables, setVariables] = useState({
          userToAdd: ''
     });
     const [showForm, setShowForm] = useState(false);
     const [errors, setErrors] = useState({});

     let usersInGroup = users.filter((user) => participants.includes(user.id));

     const [addUser] = useMutation(ADD_GROUP_USER, {
          onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors)
     });

     const hideForm = () => setShowForm(!showForm);

     const addNewUser = (e) => {
          e.preventDefault();

          addUser({
               variables: {
                    conversationId: selectedChat.group.id,
                    participants: variables.userToAdd
               },
               update: (proxy, {data}) => {
                    const returnedData = data.addGroupUser;
                    const dataInCache = proxy.readQuery({
                         query: GET_GROUPS
                    });
                    
                    const updatedGroups = dataInCache.getGroups.map((g) => 
                         g.id === returnedData.groupId ?
                              { ...g, participants: returnedData.participants }
                              : g
                    )

                    proxy.writeQuery({
                         query: GET_GROUPS,
                         data: { getGroups: updatedGroups }
                    });

                    if(selectedChat.group.id === returnedData.groupId) {
                         dispatch({
                              type: "UPDATE_GROUP",
                              payload: { group: dataInCache, chatType: "group" },
                         })
                    }
                    hideForm();
               }
          })
     }

     return (
          <Modal show={showDetailsGroup} animation={false} onHide={closeModalDetails}>
               <Modal.Header closeButton>
                    <Image src={selectedChat.group.imageUrl || "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"}
                         className="mr-2 user-pic figure-img"
                    />
                    <Modal.Title>{selectedChat.group.name}</Modal.Title>
               </Modal.Header>
               <Modal.Body className="h-50 d-inline-block modal-group">
                    {usersInGroup.map((user) => (
                         <div key={user.username} className="d-flex p-1 user-div justify-content-md-start">
                              <Image src={user.imageUrl || "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50"}
                              roundedCircle
                              className="mr-2 user-pic img-thumbnail"
                              />
                              <div className="group-details">
                                   <p className="text-success m-0">{user.username}</p>
                              </div>
                         </div>
                    ))}
               </Modal.Body>
               <Modal.Body>
                    {showForm && (
                    <Form onSubmit={addNewUser}>
                         <Form.Group>
                              <Form.Label>
                                   Invite a friend either Phone nº or email
                              </Form.Label>
                              <Form.Control
                                   required
                                   type="text"
                                   value={variables.userToAdd}
                                   onChange={(e) =>
                                   setVariables({ ...variables, userToAdd: e.target.value })
                                   }
                                   className={errors?.joined && "border-danger"}
                              />
                              {errors.joined && <small className="text-danger">{errors.joined}</small>}
                         </Form.Group>
                    </Form>
                    )}
               </Modal.Body>
               <Modal.Footer className="d-flex justify-content-sm-between">
                    <div className="d-block">
                         <small>Admin: {selectedChat.group.adminUser.username}</small>
                    </div>
                    <div className="d-block">
                         {!showForm && (
                              <Button variant="secondary" onClick={hideForm}>
                                   Add new User
                              </Button>
                         )}
                         {showForm && (
                              <Button variant="secondary" onClick={addNewUser}>
                                   Add User
                              </Button>
                         )}
                         <Button className="ml-2" variant="secondary" onClick={closeModalDetails}>
                              Close
                         </Button>
                    </div>
               </Modal.Footer>
          </Modal>
     );
}