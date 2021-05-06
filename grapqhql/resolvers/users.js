const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
const { User, Message, Conversation } = require("../../models");
const { Op } = require("sequelize");

module.exports = {
    Query: {
        getUsers: async ( _, __, {username, userId} ) => {
            try {

                //check if the user is logged!
                if (!username) throw new AuthenticationError("Unauthenticated");

                let users = await User.findAll({
                  where: { username: { [Op.ne]: username } },
                });

                //get all messages that includes the logged in user.
                const privateMessages = await Message.findAll({
                  include: [
                    {
                      model: Conversation,
                      as: "conversation",
                      where: {
                        [Op.and]: [
                          { type: "private" },
                          {
                            participants: { [Op.contains]: [parseInt(userId)] },
                          },
                        ],
                      },
                      attributes: ["participants"],
                    },
                    {
                      model: User,
                      as: "user",
                      attributes: ["username", "id"],
                    },
                  ],
                  order: [["createdAt", "DESC"]],
                });
                
                //find all messages from the user logged in.
                users = users.map(otherUser => {
                    const latestMessages = privateMessages.find(
                      (m) =>
                        m.conversation.participants.includes(otherUser.id)
                    );
                    otherUser.latestMessage = latestMessages;
                    return otherUser;
                })

                return users;

            } catch (err) {
                throw err;
            }
        },
        login: async (_, args) => {
            const { emailOrPhone, password } = args;
            let errors = {};

            try {
                if (emailOrPhone.trim() === "")
                    errors.emailOrPhone = "Login input must not be empty";
                if (password.trim() === "")
                    errors.password = "Password must not be empty";

                if (!/\S+@\S+\.\S+/.test(emailOrPhone) && !/^\d+$/.test(emailOrPhone))
                    errors.emailOrPhone = "Login details not correct";

                if (Object.keys(errors).length > 0)
                    throw new UserInputError("Login details not correct", {
                        errors,
                    });

                const user = await User.findOne({
                    where: {
                        [Op.or]: {
                            email: {
                                [Op.like]: emailOrPhone.toLowerCase(),
                            },
                            phone: {
                                [Op.like]: emailOrPhone,
                            },
                        },
                    },
                });

                if (!user) {
                    errors.username = "User not found";
                    throw new UserInputError("User not found", { errors });
                }

                const correctPassword = await bcrypt.compare(password, user.password);

                if (!correctPassword) {
                    errors.password = "User or password incorrect";
                    throw new UserInputError("User or password incorrect", {
                        errors,
                    });
                }

                return {
                    id: user.id,
                    username: user.username,
                };
            } catch (err) {
                throw err;
            }
        },
    },
    Mutation: {
        register: async (_, args) => {
            let { username, email, phone, password, confirmPassword } = args;
            let errors = {};

            try {
                // Validate input data
                if (email.trim().toLowerCase() === "")
                    errors.email = "Email must not be empty";
                if (username.trim().toLowerCase() === "")
                    errors.username = "Username must not be empty";
                if (phone.trim().toLowerCase() === "")
                    errors.phone = "Phone must not be empty";
                if (password.trim().toLowerCase() === "")
                    errors.password = "Password must not be empty";
                if (confirmPassword.trim().toLowerCase() === "")
                    errors.confirmPassword = "Confirm password must not be empty";
                if (password !== confirmPassword)
                    errors.confirmPassword = "Passwords must match";

                if (Object.keys(errors).length > 0) {
                    throw errors;
                }

                // Hash password
                password = await bcrypt.hash(password, 6);

                // Create user
                const user = await User.create({
                    username: username.toLowerCase(),
                    email: email.toLowerCase(),
                    phone,
                    password,
                });

                // Return user
                return user;
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
    },
};
