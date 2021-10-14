'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Vendors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        notNull: true
      },
      password: {
        type: Sequelize.STRING,
        notNull: true
      },
      vendor_name: {
        type: Sequelize.STRING,
        notNull: true
      },
      address:{
        type: Sequelize.TEXT,
        notNull: true
      },
      phone_number: {
        type: Sequelize.STRING,
        notNull: true
      },
      description:{
        type: Sequelize.TEXT,
        notNull: true
      },
      profile_picture: {
        type: Sequelize.STRING
      },
      is_verified: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Vendors');
  }
};