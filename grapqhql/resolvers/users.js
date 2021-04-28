const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
const { User, Message } = require('../../models');
const { Op } = require("sequelize");

module.exports = {
    Query: {
        getUsers: async ( _, __, { user } ) => {
            try {

                if (!user) throw new AuthenticationError("Unauthenticated");

                let users = await User.findAll({
                  attributes: [
                    "username",
                    "imageUrl",
                    "createdAt",
                    "phone",
                  ],
                  where: { username: { [Op.ne]: user } },
                });

                const allUserMessages = await Message.findAll({
                  where: {
                    [Op.or]: [{ from: user }, { to: user }],
                  },
                  order: [["createdAt", "DESC"]],
                });
                
                users = users.map(otherUser => {
                    const latestMessages = allUserMessages.find((m) =>
                          m.from === otherUser.username ||
                          m.to === otherUser.username
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
                                [Op.like]: emailOrPhone,
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
                    ...user.toJSON(),
                    createdAt: user.createdAt.toISOString(),
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
                    username,
                    email,
                    phone,
                    password,
                });

                // Return user
                return user;
            } catch (err) {
                if (err.name === "SequelizeUniqueConstraintError") {
                    err.errors.forEach((e) => (errors[e.path] = "User is already taken"));
                }
                if (err.name === "SequelizeValidationError") {
                    err.errors.forEach((e) => (errors[e.path] = e.message));
                }
                throw new UserInputError("There are errors (inputs)", {
                    errors,
                });
            }
        },
    },
};
