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
    hooks:{
      beforeCreate: async (vendor, options)=>{
        const salt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(vendor.password, salt);
        vendor.password = encryptedPassword;
      },
      beforeValidate: (vendor, options)=>{
        vendor.email = vendor.email.toLowerCase();
      }
    },
    sequelize,
    modelName: 'Vendor',
  });
  return Vendor;
};