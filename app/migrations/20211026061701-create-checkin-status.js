'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Checkin_Statuses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      TransactionId: {
        type: Sequelize.STRING,
        references: { model: 'Transactions', key: 'id' },
        onDelete: 'CASCADE'
      },
      checkin_code: {
        type: Sequelize.STRING
      },
      checkin_time: {
        type: Sequelize.DATE
      },
      checkout_code: {
        type: Sequelize.STRING
      },
      checkout_time: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Checkin_Statuses');
  }
};