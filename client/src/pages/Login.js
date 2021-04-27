import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { gql, useLazyQuery } from "@apollo/client";
import { Link } from 'react-router-dom';

const LOGIN_USER = gql`
  query login(
    $emailOrPhone: String!
    $password: String!
  ) {
    login(
      emailOrPhone: $emailOrPhone
      password: $password
    ) {
      username
      email
      createdAt
    }
  }
`;

export default function Login(props) {
  const [variables, setVariables] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const [loginUser, { loading }] = useLazyQuery(LOGIN_USER, {
    onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
      onCompleted: (data) => {
          props.history.push('/');
      }
  });

  const submitLoginForm = (e) => {
    e.preventDefault();

    loginUser({ variables });
  };
    return (
      <Row className="py-5 justify-content-center">
        <Col sm={8} md={6} lg={4}>
          <h1 className="text-center">Login</h1>
          <Form onSubmit={submitLoginForm}>
            <Form.Group>
              <Form.Label className={errors.username && "is-invalid"}>
                {errors.username ?? "Email or phone number"}
              </Form.Label>
              <Form.Control
                required
                className={errors.username && "is-invalid"}
                type="email"
                value={variables.username}
                onChange={(e) =>
                  setVariables({ ...variables, emailOrPhone: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className={errors.password && "text-danger"}>
                {errors.password ?? "Password"}
              </Form.Label>
              <Form.Control
                required
                className={errors.password && "is-invalid"}
                type="password"
                value={variables.password}
                onChange={(e) =>
                  setVariables({ ...variables, password: e.target.value })
                }
              />
            </Form.Group>
            <div className="text-center">
              <Button variant="success" type="submit" disabled={loading}>
                {loading ? "loading..." : "Login 🚀"}
              </Button>
              <small className="d-block p-2">
                Dont' have an account? <Link to="/register">Register</Link>
              </small>
            </div>
          </Form>
        </Col>
      </Row>
    );
}
