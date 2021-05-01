import { gql } from "@apollo/client";
import { MESSAGE_DETAILS } from './messages';

export const GROUP_DETAILS = gql`
  fragment GroupDetails on Group {
    id
    name
    admin
    type
    participants
    createdAt
    latestMessage {
      ...MessageDetails
    }
    adminUser {
      id
      username
    }
  }
  ${MESSAGE_DETAILS}
`;

export const GET_GROUPS = gql`
  query getGroups {
        getGroups {
        ...GroupDetails
    }
  }
  ${GROUP_DETAILS}
`;

export const GET_GROUP_MSGS = gql`
  query getGroupMessages($conversationId: ID!) {
    getGroupMessages(conversationId: $conversationId) {
      ...MessageDetails
    }
  }
  ${MESSAGE_DETAILS}
`;


export const SEND_GROUP_MSG = gql`
  mutation sendGroupMsg($conversationId: ID!, $body: String!) {
    sendGroupMessage(conversationId: $conversationId, body: $body) {
      ...MessageDetails
    }
  }
  ${MESSAGE_DETAILS}
`;
