const Op = require("Sequelize").Op;
const bcrypt = require("bcryptjs");
const { UserInputError } = require("apollo-server");
const { User } = require("../models");

module.exports = {
    Query: {
        getUsers: async () => {
            try {
                const user = await User.findAll();
                return user;
            } catch (err) {
                console.log(err);
            }
        },
    },
    Mutation: {
        register: async (_, args) => {
            let { username, email, phone, password, confirmPassword } = args;
            let errors = {};
          
            try {
                // Validate input data
                if (email.trim() === '')
                    errors.email = "Email must not be empty";
                if (username.trim() === '')
                    errors.username = "Username must not be empty";
                if (phone.trim() === '')
                    errors.phone = "Phone must not be empty";
                if (password.trim() === '')
                    errors.password = "Password must not be empty";
                if (confirmPassword.trim() === '')
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
                    err.errors.forEach(
                        (e) => (errors[e.path] = 'User is already taken'));
                };
                if (err.name === "SequelizeValidationError") {
                    err.errors.forEach(
                        (e) => (errors[e.path] = e.message));
                };
                  throw new UserInputError("There are errors (inputs)", {
                    errors,
                  });
            }
        },
    },
};
