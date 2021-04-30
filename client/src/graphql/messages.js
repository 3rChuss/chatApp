import { gql } from "@apollo/client";

export const MESSAGE_DETAILS = gql`
  fragment MessageDetails on Message {
    id
    content
    conversationId
    senderId
    createdAt
    user {
      id
      username
    }
  }
`;

export const GET_PRIVATE_MESSAGES = gql`
  query getPrivateMessages($userId: ID!) {
    getPrivateMessages(userId: $userId) {
      ...MessageDetails
    }
  }
  ${MESSAGE_DETAILS}
`;

export const SEND_MESSAGE = gql`
  mutation sendMessage($to: String!, $content: String!) {
    sendMessage(to: $to, content: $content) {
      id
      from
      to
      content
      createdAt
    }
  }
`;
