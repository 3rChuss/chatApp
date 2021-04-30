import { gql } from "@apollo/client";

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
      createdAt
    }
  }
`;


export const GET_USERS = gql`
  query getUsers {
    getUsers {
      username
      imageUrl
      latestMessage {
        id
        conversationId
        senderId
        content
        createdAt
      }
    }
  }
`;