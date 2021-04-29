const { gql } = require('apollo-server');

// The GraphQL schema
module.exports = gql`
  type User {
    username: String!
    email: String
    phone: String!
    createdAt: String!
    imageUrl: String
    latestMessage: Message
  }
  type Message {
    uuid: String!
    content: String!
    from: String!
    to: String!
    createdAt: String!
  }
  type MsgGroupUser {
    id: String!
    username: String!
  }
  type Group {
    id: String!
    name: String!
    participants: String!
    createdAt: String
    latestMessage: Message
  }
  type GroupParticipants {
    groupId: String!
    participants: String!
  }
  type Query {
    getUsers: [User]!
    login(emailOrPhone: String!, password: String!): User!
    getMessages(from: String!): [Message]!
    getGroups: [Group]!
    getGroupMessages(conversationId: String!): [Message]!
  }
  type Mutation {
    register(
      username: String!
      email: String!
      phone: String!
      password: String!
      confirmPassword: String!
    ): User!
    sendMessage(to: String!, content: String!): Message!
    sendGroupMessage(conversationId: String!, content: String!): Message!
    createGroup(name: String!, participants: String!): Group!
    addGroupUser(conversationId: String!, participants: String!): GroupParticipants!
  }
  type Subscription {
    newMessage: Message!
  }
`;