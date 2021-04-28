const { PubSub } = require('apollo-server');
const pubsub = new PubSub();

module.exports = context => {
    if (context.req && context.req.headers.username) {
        context.user = context.req.headers.username;
    } else if (context.connection && context.connection.context.username) {
        context.user = context.connection.context.username;
    }
    context.pubsub = pubsub;
    return context;
}