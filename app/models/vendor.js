'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vendor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Vendor.init({
    email: {
      type: DataTypes.STRING,
      allowNull:false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull:false
    },
    vendor_name: {
      type: DataTypes.STRING,
      allowNull:false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull:false
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        isNumeric:true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull:false
    },
    profile_picture: {
      type: DataTypes.STRING,
      defaultValue: "profile_pict.jpg"
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Vendor',
  });
  return Vendor;
};