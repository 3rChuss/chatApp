'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Conversation, User}) {
      this.belongsTo(Conversation, {
        foreignKey: "conversationId",
        as: "conversation",
      });
      this.belongsTo(User, {
        foreignKey: 'senderId',
        as: 'user'
      });
    }
  };
  Message.init(
    {
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull:false
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: "Message",
      tableName: "messages",
    }
  );
  return Message;
};