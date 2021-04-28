const { UserInputError, PubSub, withFilter} = require("apollo-server");
const { Op } = require('sequelize');
const { Message, User } = require("../../models");

const pubsub = new PubSub();

module.exports = {
    Query: {
        getMessages: async (parent, { from }, { user }) => {
            try {
                if (!user) throw new AuthenticationError("Unauthenticated");

                const otherUser = await User.findOne({
                    where: { username: user },
                });

                if (!otherUser) throw new UserInputError("User not found");

                const usernames = [otherUser.username, from];
                const messages = await Message.findAll({
                    where: {
                        from: {
                            [Op.in]: usernames,
                        },
                        to: {
                            [Op.in]: usernames,
                        },
                    },
                    order: [["createdAt", "DESC"]],
                });

                return messages;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
    },
    Mutation: {
        sendMessage: async (_, { to, content }, { user }) => {
            try {
                const recipient = await User.findOne({ where: { username: to } });

                if (!recipient) {
                    throw new UserInputError("User not found");
                } else if (recipient.username === user) {
                    throw new UserInputError("You can't message to yourself :)");
                }
                if (content.trim() === "") throw new UserInputError("Message is empty");

                const message = await Message.create({
                    from: user,
                    to,
                    content,
                });

                pubsub.publish("NEW_MESSAGE", { newMessage: message });

                return message;
            } catch (err) {
                console.log(err);
                throw err;
            }
        },
    },
    Subscription: {
        newMessage: {
            subscribe: withFilter(
                (_, __, { pubsub, user }) => {
                    console.log(newMessage);
                    if (!user) throw new AuthenticationError("Unauthenticated");
                    return pubsub.asyncIterator(["NEW_MESSAGE"]);
                },
                ({ newMessage }, _, { user }) => {
                    if (
                        newMessage.from === user ||
                        newMessage.to === user
                    ) {
                        return true;
                    }

                    return false;
                }
            ),
        },
    },
};
