'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Vendors', 'url', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Users', 'url', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Venue_Photos', 'url', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Documents', 'url', {
      type: Sequelize.STRING
    });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Vendors', 'url');
    await queryInterface.removeColumn('Users', 'url');
    await queryInterface.removeColumn('Venue_Photos', 'url');
    await queryInterface.removeColumn('Documents', 'url');
  }
};
