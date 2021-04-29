"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate({ User }) {
      this.belongsTo(User, {
        foreignKey: "admin",
        as: "adminUser",
      });
    }
  }

  Conversation.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("private", "group"),
        allowNull: false,
      },
      participants: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Conversation",
      tableName: "conversations",
    }
  );
  return Conversation;
};
