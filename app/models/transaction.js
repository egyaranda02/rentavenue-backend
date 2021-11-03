'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaction.belongsTo(models.Venue)
      Transaction.belongsTo(models.User)
      Transaction.hasOne(models.Checkin_Status)
      Transaction.hasOne(models.Feedback)
    }
  };
  Transaction.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
      unique: true
    },
    UserId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    VenueId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    start_book: {
      allowNull: false,
      type: DataTypes.DATE
    },
    finish_book: {
      allowNull: false,
      type: DataTypes.DATE
    },
    total_payment: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    token: {
      type: DataTypes.STRING
    },
    payment_status: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: "pending"
    },
    expiredAt: {
      type: DataTypes.DATE
    }

  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};