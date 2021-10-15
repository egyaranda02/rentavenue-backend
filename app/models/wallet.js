'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Wallet.belongsTo(models.User)
      Wallet.belongsTo(models.Vendor)
    }
  };
  Wallet.init({
    UserId: {
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    VendorId: {
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    balance: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Wallet',
  });
  return Wallet;
};