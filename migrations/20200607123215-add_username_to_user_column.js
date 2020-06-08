'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn('users','username', {
        type: Sequelize.STRING,
        allowNull: true
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users','username')
  }
};