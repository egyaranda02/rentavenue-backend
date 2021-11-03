'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Feedback.belongsTo(models.Transaction)
    }
  };
  Feedback.init({
    TransactionId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    feedback_content: {
      type: DataTypes.TEXT
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: {
        max: 5,
        min: 1
      }
    }
  }, {
    sequelize,
    modelName: 'Feedback',
  });
  return Feedback;
};