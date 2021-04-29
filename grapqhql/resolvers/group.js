const { Conversation, User, Message } = require("../../models");
const { Op } = require("sequelize");
const { UserInputError } = require("apollo-server");

module.exports = {
    Query: {
        getGroups: async (_, __, { user }) => {
            try {
                let groupConversations = await Conversation.findAll({
                    include: [
                        {
                            model: User,
                            as: "adminUser",
                            attributes: ["id", "username"],
                        },
                    ],
                });

                const groupConversationsUpdated = groupConversations.map((u) => {
                    let conversations;
                    if (u.participants.includes(user)) {
                        conversations = Object.assign(u);
                        return conversations;
                    }
                });

                const groupMessages = await Message.findAll({
                    include: [
                        {
                            model: Conversation,
                            as: "conversation",
                            attributes: [],
                        },
                        {
                            model: User,
                            as: "user",
                            attributes: ["username"],
                        },
                    ],
                    order: [["createdAt", "DESC"]],
                });

                //console.log(groupMessages);


                groupConversations = groupConversations.map((groupConv) => {
                    const latestMessage = groupMessages.find(
                      (message) => message.uuid === groupConv.id
                    );
                    groupConv.latestMessage = latestMessage;
                    return groupConv;
                });

                return groupConversations;
            } catch (err) {
                throw new UserInputError(err);
            }
        },
    },
    Mutation: {
        createGroup: async (_, args, { user }) => {
            const { name, participants } = args;
          
            let usersInGroup = participants.split(',');

            if (name.trim() === "") {
                throw new UserInputError("Name field must not be empty.");
            }

            if (name.length > 30) {
                throw new UserInputError(
                    "Title character length must not be more than 30."
                );
            }

            try {
                const users = await User.findAll();
                const userIds = users.map((u) => u.username);

                if (!usersInGroup.find((p) => userIds.includes(p.trim()))) {
                    throw new UserInputError(
                        "Participants array must contain valid user IDs."
                    );
                }



                const group = await Conversation.create({
                    name,
                    admin: user,
                    participants: participants,
                });

                return {
                    ...group.toJSON(),
                    adminUser: { id: user, username: user },
                };
            } catch (err) {
                throw new UserInputError(err);
            }
        },
        addGroupUser: async (_, args, { user }) => {
            const { conversationId, participants } = args;

            if (!participants || participants.length === 0) {
                throw new UserInputError("Participants field must not be empty.");
            }

            try {
                const groupConversation = await Conversation.findOne({
                    where: { id: conversationId },
                });

                if (!groupConversation) {
                    throw new UserInputError(
                        `Invalid conversation ID.`
                    );
                }

                if (groupConversation.admin !== user) {
                    throw new UserInputError("Access is denied.");
                }

                const users = await User.findAll();
                const userIds = users.map((u) => u.username);

                const isInAlready = userIds.includes(participants);

                if (isInAlready) {
                    throw new UserInputError(
                        "Participants is already in"
                    );
                }

                const usersIn = groupConversation.participants.split(',').map(s => s.trim());


                const updatedParticipants = [
                    ...usersIn,
                    participants
                ];

                if (
                    usersIn.filter((p, i) => i !== usersIn.indexOf(p)).length !== 0 ||
                    usersIn.includes(participants)
                ) {
                    throw new UserInputError(
                        "Participants array must not contain duplicate or already added users."
                    );
                }

                groupConversation.participants = updatedParticipants.join(', ');
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
