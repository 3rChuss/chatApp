const { PubSub } = require('apollo-server');
const pubsub = new PubSub();

module.exports = context => {
    if (context.req && context.req.headers.username) {
        context.username = context.req.headers.username;
        context.userId = context.req.headers.userid;
    } else if (context.connection && context.connection.context.username) {
        context.username = context.connection.context.username;
        context.userId = context.connection.context.userId;
    }
    context.pubsub = pubsub;
    return context;
}