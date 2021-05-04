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
  mutation sendGroupMsg($conversationId: ID!, $content: String!) {
    sendGroupMessage(conversationId: $conversationId, content: $content) {
      ...MessageDetails
    }
  }
  ${MESSAGE_DETAILS}
`;

export const CREATE_GROUP = gql`
  mutation createNewGroup($name: String!, $participants: String!) {
    createGroup(name: $name, participants: $participants) {
      ...GroupDetails
    }
  }
  ${GROUP_DETAILS}
`;

export const ADD_GROUP_USER = gql`
  mutation addUser($conversationId: ID!, $participants: String!) {
    addGroupUser(conversationId: $conversationId, participants: $participants) {
      groupId
      participants
    }
  }
`;
