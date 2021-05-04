import React, {useState} from 'react';
import {Modal, Button, Form} from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { GET_GROUPS, CREATE_GROUP } from "../../graphql/groups";

export default function CreateGorup({showNewGroup, closeModalNewgroup}){
     const [variables, setVariables] = useState({
          name: '',
          participants: []
     });
     const [errors, setErrors] = useState({});
       

     const [createNewGroup] = useMutation(CREATE_GROUP, {
          onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors)
     });

     const submitGroup = (e) => {
          e.preventDefault();

          if(variables.name.trim() === ""){
               errors.name = "Name can't be empty";
          }else if (variables.participants.length === 0){
               errors.participants = "Did you add a member to join?"
          } else {
               createNewGroup({
                    variables,
                    update: (proxy, {data}) => {
                         const returnedData = data.createGroup;
                         const dataCache = proxy.readQuery({
                              query: GET_GROUPS
                         });

                         proxy.writeQuery({
                              query: GET_GROUPS,
                              data:{
                                   getGroups:[...dataCache.getGroups, returnedData]
                              }
                         });
                    }
               })
          }
     }

     return (
          <Modal show={showNewGroup} animation={false} onHide={closeModalNewgroup}>
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
                              {!variables.name && <small className="text-danger">Requiered</small>}
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
                                   className={errors?.participants && "border-danger"}
                              />
                              {!variables.name && <small className="text-danger">A participant is requiered</small>}
                              {errors.emailorphone && <small className="text-danger">{errors.emailorphone}</small>}
                              {errors.admin && <small className="text-danger">{errors.admin}</small>}
                         </Form.Group>
                    </Form>
               </Modal.Body>
               <Modal.Footer>
                    <Button variant="secondary" onClick={closeModalNewgroup}>
                         Close
                    </Button>
                    <Button variant="primary" onClick={submitGroup}>
                         Save Changes
                    </Button>
               </Modal.Footer>
          </Modal>
     );
}