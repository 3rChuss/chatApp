const { gql } = require('apollo-server');

// The GraphQL schema
module.exports = gql`
  type User {
    username: String!
    email: String!
    phone: String!
    createdAt: String!
  }
  type Message {
    uuid: String!
    content: String!
    from: String!
    to: String!
    createdAt: String!
  }
  type Query {
    getUsers: [User]!
    login(emailOrPhone: String!, password: String!): User!
    getMessages(from: String!, to: String!): [Message]!
  }
  type Mutation {
    register(
      username: String!
      email: String!
      phone: String!
      password: String!
      confirmPassword: String!
    ): User!
    sendMessage(
      from: String!
      to: String!
      content: String!
    ): Message!
  }
`;