'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Admin.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING
  },{
      hooks:{
        beforeCreate: async (admin, options)=>{
          const salt = await bcrypt.genSalt();
          const encryptedPassword = await bcrypt.hash(admin.password, salt);
          admin.password = encryptedPassword;
        },
        beforeValidate: (admin, options)=>{
          admin.email = admin.email.toLowerCase();
        }
      },
    sequelize,
    modelName: 'Admin',
  });
  return Admin;
};