'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('github_resources', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        type: {
          type: Sequelize.ENUM('ISSUE', 'PULL_REQUEST'),
          unique: 'uk_type_resource_id_project_owner',
          allowNull: false
        },
        resource_id: {
          type: Sequelize.INTEGER,
          unique: 'uk_type_resource_id_project_owner',
          allowNull: false
        },
        project: {
          type: Sequelize.STRING,
          unique: 'uk_type_resource_id_project_owner',
          allowNull: false
        },
        owner: {
          type: Sequelize.STRING,
          unique: 'uk_type_resource_id_project_owner',
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('OPEN', 'CLOSED', 'MERGED'),
          allowNull: false,
          defaultValue: 'OPEN'
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      })
      .then(() =>
        queryInterface.addIndex('github_resources', {
          fields: ['type', 'resource_id', 'project', 'owner'],
          unique: true
        })
      )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('github_resources')
  }
}
