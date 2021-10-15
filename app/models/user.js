'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.Wallet)
    }
  };
  User.init({
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
    firstName: {
      type: DataTypes.STRING,
      allowNull:false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull:false
    },
    gender: {
      type: DataTypes.STRING,
      allowNull:false
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        isNumeric:true
      }
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
      beforeCreate: async (user, options)=>{
        const salt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(user.password, salt);
        user.password = encryptedPassword;
      },
      beforeValidate: (user, options)=>{
        user.email = user.email.toLowerCase();
      }
    },
    sequelize,
    modelName: 'User',
  });
  return User;
};