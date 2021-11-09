'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  class Vendor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Vendor.hasOne(models.Wallet)
      Vendor.hasMany(models.Venue)
    }
  };
  Vendor.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6],
        notEmpty: true
      }
    },
    vendor_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true,
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    profile_picture: {
      type: DataTypes.STRING,
      defaultValue: "profile_pict.jpg"
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    url: {
      type: DataTypes.STRING,
      defaultValue: "https://i.stack.imgur.com/34AD2.jpg"
    }
  }, {
    hooks: {
      beforeCreate: async (vendor, options) => {
        const salt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(vendor.password, salt);
        vendor.password = encryptedPassword;
      },
      beforeValidate: (vendor, options) => {
        vendor.email = vendor.email.toLowerCase();
      }
    },
    sequelize,
    modelName: 'Vendor',
  });
  return Vendor;
};