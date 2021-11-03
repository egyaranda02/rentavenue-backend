'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        type: Sequelize.STRING
      },
      UserId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      VenueId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Venues', key: 'id' },
        onDelete: 'CASCADE'
      },
      start_book: {
        allowNull: false,
        type: Sequelize.DATE
      },
      finish_book: {
        allowNull: false,
        type: Sequelize.DATE
      },
      total_payment: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      token: {
        type: Sequelize.STRING
      },
      payment_status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      expiredAt: {
        type: Sequelize.DATE
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Transactions');
  }
};