const { UserInputError, PubSub, withFilter} = require("apollo-server");
const { Op } = require('sequelize');
const { Message, User, Conversation } = require("../../models");

const pubsub = new PubSub();

module.exports = {
  Query: {
    getPrivateMessages: async (_, args, context) => {
      const { userId } = args;
      try {
        const user = await User.findOne({ where: { id: parseInt(userId) } });

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
          order: [["createdAt", "DESC"]],
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
          order: [["createdAt", "DESC"]],
        });

        return messages;
      } catch (err) {
        throw new UserInputError(err);
      }
    },
  },

  Mutation: {
    sendPrivateMessage: async (_, args, { username, userId }) => {
      const { receiverId, content } = args;

      if (content.trim() === "") throw new UserInputError("Content is empty");

      try {
        let conversation = await Conversation.findOne({
          where: {
            [Op.and]: [
              { type: "private" },
              {
                participants: { [Op.contains]: [parseInt(userId), receiverId] },
              },
            ],
          },
        });

        if (!conversation) {
          const newConversation = new Conversation({
            type: "private",
            participants: [parseInt(userId), parseInt(receiverId)],
          });
          conversation = await newConversation.save();
        }

        const newMessage = await Message.create({
          conversationId: conversation.id,
          senderId: parseInt(userId),
          content,
        });


        pubsub.publish("NEW_MESSAGE", {
          newMessage: {
            message: {
              ...newMessage.toJSON(),
              user: { id: parseInt(userId), username: username },
            },
            type: "private",
            participants: conversation.participants,
          },
        });

        return newMessage;
      } catch (err) {
        throw err;
      }
    },
    sendGroupMessage: async (_,args, {username, userId}) => {
      const {conversationId, content} = args;
      if(content.trim()==='') throw new UserInputError('Message content must not be empty');

      try {
        const groupConversations = await Conversation.findOne({
          where: {id: conversationId}
        });

        if(!groupConversations || groupConversations.type !== 'group') throw new UserInputError('Invalid groud id');

        if(!groupConversations.participants.includes(parseInt(userId))) {
          throw new UserInputError('Access denied, not a member')
        }

        const newMessage = await Message.create({
          conversationId, 
          senderId: parseInt(userId),
          content
        });

        pubsub.publish('NEW_MESSAGE', {
          newMessage:{
            message: {
              ...newMessage.toJSON(),
              user: {id:userId, username}
            },
            type: 'group',
            participants: groupConversations.participants
          }
        });

        return newMessage;

      } catch (err) {
        throw new UserInputError(err)
      }
    }
  },
  Subscription: {
    // newMessage: {
    //   subscribe: withFilter(
    //     (_, __, context) => {
    //       if (context.username) {
    //         return pubsub.asyncIterator(["NEW_MESSAGE"])
    //       }
    //     },
    //     ({ newMessage }, _, {userId}) => {
    //       return (
    //         newMessage.participants.includes(parseInt(userId))
    //       );
    //     }
    //   ),
    // },
    newMessage:{
      subscribe: withFilter((_,__,context) => pubsub.asyncIterator(['NEW_MESSAGE']), ({newMessage}, _, {userId}) => {
        return newMessage.participants.includes(parseInt(userId));
      })
    }
  },
};
