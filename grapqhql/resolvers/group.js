const { Conversation, User, Message } = require("../../models");
const { Op } = require("sequelize");
const { UserInputError } = require("apollo-server");

module.exports = {
    Query: {
        getGroups: async (_, __, {username, userId}) => {
            try {
                let groupConversations = await Conversation.findAll({
                    where: {
                        [Op.and]: [
                            { type: "group" },
                            {
                                participants: { [Op.contains]: [parseInt(userId)] },
                            },
                        ],
                    },
                    include: [
                        {
                            model: User,
                            as: "adminUser",
                            attributes: ["id", "username"],
                        },
                    ],
                });


                const groupMessages = await Message.findAll({
                  include: [
                    {
                      model: Conversation,
                      as: "conversation",
                      where: {
                        [Op.and]: [
                          { type: "group" },
                          {
                            participants: { [Op.contains]: [parseInt(userId)] },
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

                groupConversations = groupConversations.map(
                    (groupConv) => {
                    const latestMessage = groupMessages.find(
                        (message) =>
                        message.conversationId === groupConv.id
                    );
                    groupConv.latestMessage = latestMessage;
                    return groupConv;
                    }
              );

                return groupConversations;
            } catch (err) {
                throw new UserInputError(err);
            }
        },
    },
    Mutation: {
      createGroup: async (_, args, { username, userId }) => {
        const { name, participants } = args;
        console.log(name, participants);

        if (name.trim() === '') {
          throw new UserInputError('Name field must not be empty.');
        }

        if (name.length > 30) {
          throw new UserInputError(
            'Title character length must not be more than 30.'
          );
        }

        try {
          const users = await User.findAll();
          const userIds = users.map((u) => u.id.toString());

          if (!participants.every((p) => userIds.includes(p))) {
            throw new UserInputError(
              'Participants array must contain valid user IDs.'
            );
          }

          if (
            participants.filter((p, i) => i !== participants.indexOf(p))
              .length !== 0 ||
            participants.includes(loggedUser.id.toString())
          ) {
            throw new UserInputError(
              'Participants array must not contain duplicate IDs.'
            );
          }

          const group = await Conversation.create({
            name,
            admin: loggedUser.id,
            type: 'group',
            participants: [loggedUser.id, ...participants],
          });

          return {
            ...group.toJSON(),
            adminUser: { id: loggedUser.id, username: loggedUser.username },
          };

        } catch (err) {
          throw new UserInputError(err);
        }
      },

      addGroupUser: async (_, args, { username, userId }) => {
          const { conversationId, participants } = args;

          if (!participants || participants.length === 0) {
              throw new UserInputError("Participants field must not be empty.");
          }

          try {
              const groupConversation = await Conversation.findOne({
                  where: { id: conversationId },
              });

              if (!groupConversation.admin !== userId) {
                  throw new UserInputError('Unauthorized');
              }


              const users = await User.findAll();
              const userIds = users.map((u) => u.id.toString());


              const updatedParticipants = [
                  ...groupConversation.participants,
                  participants,
              ];

              if (
                updatedParticipants.filter(
                  (p, i) => i !== updatedParticipants.indexOf(p)
                ).length !== 0 ||
                updatedParticipants.includes(userId)
              ) {
                throw new UserInputError(
                  "Participants array must not contain duplicate or already added users."
                );
              }

              groupConversation.participants = updatedParticipants;
              const savedConversation = await groupConversation.save();
              return {
                  groupId: savedConversation.id,
                  participants: savedConversation.participants,
              };
          } catch (err) {
              throw new UserInputError(err);
          }
        },
    },
};
