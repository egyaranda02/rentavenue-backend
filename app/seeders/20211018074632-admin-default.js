'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Admins', [{
      email: 'admin@gmail.com',
      password: '$2b$10$87TVRADaSSJuE4s2RVMB0uvWproCG3eZ5PJfdy526pHWmNYfIwJ5u',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Admins', null, {});

  }
};
