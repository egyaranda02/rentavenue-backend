'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Venues', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      VendorId: {
        type: Sequelize.INTEGER,
        references: {model: 'Vendors', key:'id'},
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      capacity:{
        type: Sequelize.INTEGER,
        allowNull:false
      },
      description:{
        type: Sequelize.TEXT,
        allowNull: false,
      },
      price:{
        type: Sequelize.INTEGER,
        allowNull:false
      },
      city:{
        type: Sequelize.STRING,
        allowNull:false
      },
      address:{
        type: Sequelize.TEXT,
        notNull: true
      },
      longitude:{
        type: Sequelize.STRING,
        allowNull:false
      },
      latitude:{
        type: Sequelize.STRING,
        allowNull:false
      },
      is_verified: {
        type: Sequelize.BOOLEAN
      },
      status: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Venues');
  }
};