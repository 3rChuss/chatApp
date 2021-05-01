const { UserInputError, PubSub, withFilter} = require("apollo-server");
const { Op } = require('sequelize');
const { Message, User, Conversation } = require("../../models");

const pubsub = new PubSub();

module.exports = {
  Query: {
    getPrivateMessages: async (_, args, context) => {
      const { userId } = args;
      try {
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
          throw new UserInputError(
            `User with id: ${userId} does not exist in DB.`
          );
        }

        const messages = await Message.findAll({
          include: [
            {
              model: Conversation,
              as: "conversation",
              where: {
                [Op.and]: [
                  { type: "private" },
                  {
                    participants: {
                      [Op.contains]: [
                        parseInt(context.userId),
                        parseInt(userId),
                      ],
                    },
                  },
                ],
              },
              attributes: [],
            },
            {
              model: User,
              as: "user",
              attributes: ["username", "id"],
            },
          ],
          order: [["createdAt", "ASC"]],
        });

        return messages;
      } catch (err) {
        throw new UserInputError(err);
      }
    },
    getGroupMessages: async (_, args, { username, userId }) => {
      const { conversationId } = args;

      try {
        const groupConversation = await Conversation.findOne({
          where: { id: conversationId },
        });

        if (!groupConversation || groupConversation.type !== "group") {
          throw new UserInputError(
            `Invalid conversation ID, or conversation isn't of group type.`
          );
        }

        if (!groupConversation.participants.includes(parseInt(userId))) {
          throw new UserInputError(
            "Access is denied. Only members of the group can view messages."
          );
        }

        const messages = await Message.findAll({
          include: [
            {
              model: Conversation,
              as: "conversation",
              where: {
                id: conversationId,
              },
              attributes: [],
            },
            {
              model: User,
              as: "user",
              attributes: ["username", "id"],
            },
          ],
          order: [["createdAt", "ASC"]],
        });

        return messages;
      } catch (err) {
        throw new UserInputError(err);
      }
    },
  },

  Mutation: {
    // sendMessage: async (_, { to, type, content }, { user }) => {
    //     try {
    //         const recipient = await User.findOne({ where: { username: to } });
    //         if (!recipient) {
    //             throw new UserInputError("User not found");
    //         } else if (recipient.username === user) {
    //             throw new UserInputError("You can't message to yourself :)");
    //         }
    //         if (content.trim() === "") throw new UserInputError("Message is empty");
    //         const message = await Message.create({
    //             from: user,
    //             type,
    //             to,
    //             content,
    //         });
    //         pubsub.publish("NEW_MESSAGE", { newMessage: message });
    //         return message;
    //     } catch (err) {
    //         console.log(err);
    //         throw err;
    //     }
    // },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { user }) => {
          if (!user) throw new AuthenticationError("Unauthenticated");
          return pubsub.asyncIterator(["NEW_MESSAGE"]);
        },
        ({ newMessage }, _, { user }) => {
          if (newMessage.from === user || newMessage.to === user) {
            return true;
          }

          return false;
        }
      ),
    },
  },
};
