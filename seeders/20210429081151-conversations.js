"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      "conversations",
      [
        {
          name: "Test group",
          type: "group",
          admin: 2,
          participants: [2,1,15],
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
