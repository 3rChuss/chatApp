const { gql } = require('apollo-server');

// The GraphQL schema
module.exports = gql`
  enum AddOrDelete {
    ADD
    DELTE
  }
  type User {
    id: ID!
    username: String!
    email: String
    phone: String!
    imageUrl: String
    latestMessage: Message
  }
  type MsgGroupUser {
    id: ID!
    username: String!
  }
  type Message {
    id: ID!
    content: String!
    conversationId: ID!
    senderId: ID!
    createdAt: String!
    user: MsgGroupUser
  }
  type subMessage {
    message: Message!
    type: String!
    participants: [ID!]!
  }
  type Group {
    id: ID!
    name: String!
    admin: ID!
    type: String!
    participants: [ID!]!
    createdAt: String!
    latestMessage: Message
    adminUser: MsgGroupUser
  }
  type GroupName {
    groupId: ID!
    name: String!
  }
  type GroupParticipants {
    groupId: ID!
    participants: [ID!]!
  }

  type Query {
    login(emailOrPhone: String!, password: String!): User!

    getUsers: [User]!
    getGroups: [Group]!

    getPrivateMessages(userId: ID!): [Message]!
    getGroupMessages(conversationId: ID!): [Message]!
    getImageGroup(groupId: ID!) : Group!
  }

  type Mutation {
    register(
      username: String!
      email: String!
      phone: String!
      password: String!
      confirmPassword: String!
    ): User!

    sendPrivateMessage(receiverId: ID!, content: String!): Message!
    sendGroupMessage(conversationId: ID!, content: String!): Message!

    createGroup(name: String!, participants: String!): Group!
    addGroupUser(conversationId: ID!, participants: String!): GroupParticipants!
  }
  type Subscription {
    newMessage: subMessage!
  }
`;