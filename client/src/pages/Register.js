import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import { Link } from 'react-router-dom';
import { REGISTER_USER } from '../graphql/users';

export default function RegisterForm(props) {
    
  const [variables, setVariables] = useState({
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const [register, { loading }] = useMutation(REGISTER_USER, {
    update: (_, __) => props.history.push('/login'),
    onError: (err) => setErrors(err.graphQLErrors),
  });

  const submitRegisterForm = (e) => {
    e.preventDefault();
    register({ variables });
  };

  //TODO
  //add class validations to the inputs
    return (
      <Row className="py-5 justify-content-center">
        <Col sm={8} md={6} lg={4}>
          <h1 className="text-center">Register</h1>
          <Form onSubmit={submitRegisterForm}>
            <Form.Group>
              <Form.Label>Email address</Form.Label>
              <Form.Control
                required
                type="email"
                value={variables.email}
                onChange={(e) =>
                  setVariables({ ...variables, email: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                required
                type="text"
                value={variables.phone}
                onChange={(e) =>
                  setVariables({ ...variables, phone: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control
                required
                type="text"
                value={variables.username}
                onChange={(e) =>
                  setVariables({ ...variables, username: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control
                required
                type="password"
                value={variables.password}
                onChange={(e) =>
                  setVariables({ ...variables, password: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Repeat password</Form.Label>
              <Form.Control
                required
                type="password"
                value={variables.confirmPassword}
                onChange={(e) =>
                  setVariables({
                    ...variables,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </Form.Group>
            <div className="text-center">
              <Button variant="success" type="submit" disabled={loading}>
                {loading ? "loading..." : "Register 🏀"}
              </Button>
              <small className="d-block p-2">
                Already have an account? <Link to="/login">Login</Link>
              </small>
            </div>
          </Form>
        </Col>
      </Row>
    );
}
