import { gql } from "@apollo/client";
import { MESSAGE_DETAILS } from "./messages";

export const LOGIN_USER = gql`
  query login($emailOrPhone: String!, $password: String!) {
    login(emailOrPhone: $emailOrPhone, password: $password) {
      id
      username
    }
  }
`;

export const REGISTER_USER = gql`
  mutation register(
    $username: String!
    $email: String!
    $phone: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      username: $username
      email: $email
      phone: $phone
      password: $password
      confirmPassword: $confirmPassword
    ) {
      username
      id
    }
  }
`;

export const GET_USERS = gql`
  query getUsers {
    getUsers {
      id
      username
      imageUrl
      latestMessage {
        ...MessageDetails
      }
    }
  }
  ${MESSAGE_DETAILS}
`;