const userResolvers = require('./users');
const messageResolvers = require("./messages");
//const groupResolvers = require("./group");

module.exports = {
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query,
    //...groupResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
    //...groupResolvers.Mutation,
  },
  Subscription: {
    ...messageResolvers.Subscription,
  },
};