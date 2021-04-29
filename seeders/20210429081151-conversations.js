"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      "conversations",
      [
        {
          name: "Global Chat",
          admin: "3rchuss",
          participants: "Jane, aaa",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("conversations", null, {});
  },
};
