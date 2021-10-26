'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Checkin_Status extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Checkin_Status.belongsTo(models.Transaction)
    }
  };
  Checkin_Status.init({
    TransactionId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    checkin_code: {
      type: DataTypes.STRING
    },
    checkin_time: {
      type: DataTypes.DATE
    },
    checkout_code: {
      type: DataTypes.STRING
    },
    checkout_time: {
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    modelName: 'Checkin_Status',
  });
  return Checkin_Status;
};