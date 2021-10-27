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
      Feedback.belongsTo(models.Venue)
    }
  };
  Feedback.init({
    UserId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    VenueId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    feedback_content: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    rating: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'Feedback',
  });
  return Feedback;
};