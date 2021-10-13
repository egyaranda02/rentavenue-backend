'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
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
      firstName: {
        type: Sequelize.STRING,
        notNull: true
      },
      lastName: {
        type: Sequelize.STRING,
        notNull: true
      },
      gender: {
        type: Sequelize.STRING,
        notNull: true
      },
      phone_number: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Users');
  }
};