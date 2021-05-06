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
        let errors = {};

        if (!/\S+@\S+\.\S+/.test(participants) && !/^\d+$/.test(participants)){
            errors.emailorphone = "Phone or email incorrect";
        }
        try {
          const user = await User.findOne({
                where: {
                    [Op.or]: {
                        email: {
                            [Op.like]: participants,
                        },
                        phone: {
                            [Op.like]: participants,
                        },
                    },
                },
            });

            if (!user || user === null) {
                errors.user = "User not found";
            }

            if (user.id === parseInt(userId)){
              errors.admin = 'You are already the admin';
            }


            if (Object.keys(errors).length > 0) {
                  throw errors;
                }

            const group = await Conversation.create({
              name,
              admin: parseInt(userId),
              type: 'group',
              participants: [parseInt(userId), user.id],
            });

            return {
              ...group.toJSON(),
              adminUser: { id: userId, username },
            };

          } catch (err) {
                if (err.name === "SequelizeUniqueConstraintError") {
                    throw new UserInputError('User already taken');
                }
                if (err.name === "SequelizeValidationError") {
                    err.errors.forEach((e) => (errors[e.path] = e));
                }
                throw new UserInputError("There are errors (inputs)", {
                    errors,
                });
            }
      },
      addGroupUser: async (_, args, { username, userId }) => {
          const { conversationId, participants } = args;
          let errors = {};

          if (participants === '') {
              errors.participants = "Participants must not be empty.";
          }

          try {
              const groupConversation = await Conversation.findOne({
                  where: { id: conversationId },
              });

              if (groupConversation.admin !== parseInt(userId)) {
                  errors.notAdmin = 'Unauthorized';
              }

              const user = await User.findOne({
                  where: {
                    [Op.or]: {
                      email: {
                          [Op.like]: participants,
                      },
                      phone: {
                          [Op.like]: participants,
                      },
                    },
                  },
                });

              if (!user) {
                errors.user = `User: ${participants} not found`;
              }

              const participantsIn = groupConversation.participants.filter((p) => p === user.id);

              if (participantsIn.length !== 0){
                errors.joined = 'Already joined';
              }


              if (Object.keys(errors).length > 0) {
                    throw errors;
                }

              const updatedParticipants = [
                  ...groupConversation.participants,
                  user.id,
              ];

              groupConversation.participants = updatedParticipants;
              
              const savedConversation = await groupConversation.save();
              return {
                  groupId: savedConversation.id,
                  participants: savedConversation.participants,
              };
          } catch (err) {
                if (err.name === "SequelizeUniqueConstraintError") {
                    throw new UserInputError('User already taken');
                }
                if (err.name === "SequelizeValidationError") {
                    err.errors.forEach((e) => (errors[e.path] = e));
                }
                throw new UserInputError("There are errors (inputs)", {
                    errors,
                });
            }
        },
      // addImageGroup: async (_, args, {username, userId}) => {
      //   const {groupId, url} = args;

      //   const group = Conversation.build({
      //     where: {conversationId: groupId}
      //   });

      //   if(!group){
      //     throw new UserInputError('Group ID not found');
      //   }
      //   if(url.trim()=== "") {
      //     throw new UserInputError('Url must not be empty')
      //   }

      //   group.imageUrl = url;
      //   const groupUdated = await group.save();
      //   return groupUdated;

      // }
    },
};
