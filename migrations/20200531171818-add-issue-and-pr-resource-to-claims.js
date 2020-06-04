'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn('claims', 'pr_resource_id', {
        type: Sequelize.INTEGER,
        references: {
          key: 'id',
          model: 'github_resources'
        },
        allowNull: true
      })
      .then(() =>
        queryInterface.addColumn('claims', 'issue_resource_id', {
          type: Sequelize.INTEGER,
          references: {
            key: 'id',
            model: 'github_resources'
          },
          allowNull: true
        })
      )
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('claims', 'pr_resource_id'),
      queryInterface.removeColumn('claims', 'issue_resource_id')
    ])
  }
}
