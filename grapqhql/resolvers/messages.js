const { UserInputError } = require("apollo-server");
const { Op } = require('sequelize');
const { Message, User } = require("../../models");

module.exports = {
    Query: {
        getMessages: async (parent, { from, to }, context) => {
            try {
                const otherUser = await User.findOne({ where: { username: from } });
                if (!otherUser) throw new UserInputError('User not found');
                console.log(context);

                const usernames = [from, to];
                const messages = await Message.findAll({
                    where: {
                        from: {
                            [Op.in]: usernames,
                        },
                        to: {
                            [Op.in]: usernames
                        },
                    },
                    order: [['createdAt', 'DESC']],
                });
                return messages;
            } catch (error) {
                console.log(error);
                throw error;
            }
        }
    },
    Mutation: {
        sendMessage: async (parent, { from, to, content }, context) => {
            try {
                const recipient = await User.findOne({ where: { username: to } });

                if (!recipient) {
                    throw new UserInputError("User not found");
                } else if (recipient.username === from) {
                    throw new UserInputError("You can't message to yourself :)");
                }
                if (content.trim() === "") throw new UserInputError("Message is empty");

                const message = await Message.create({
                    from,
                    to,
                    content,
                });

                return message;
            } catch (err) {
                console.log(err);
                throw err;
            }
        },
    },
};
