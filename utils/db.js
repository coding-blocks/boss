/**
 * Created by championswimmer on 15/05/17.
 */
const Sequelize = require('sequelize')
const config = require('../config')
const secrets = config.secrets

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL)
  : new Sequelize(secrets.BOSS_DB_NAME, secrets.BOSS_DB_USER, secrets.BOSS_DB_PASS, {
      host: secrets.BOSS_DB_HOST || 'localhost',
      dialect: 'postgres',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      }
    })

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  oneauthId: Sequelize.STRING,
  username: Sequelize.STRING,
  role: Sequelize.ENUM(['admin', 'user'])
})

const Claim = sequelize.define('claim', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user: Sequelize.STRING,
  issueUrl: Sequelize.STRING,
  pullUrl: { type: Sequelize.STRING, unique: true },
  repo: Sequelize.STRING,
  reason: Sequelize.STRING,
  bounty: Sequelize.INTEGER,
  status: Sequelize.ENUM(Object.keys(config.CLAIM_STATUS).map(key => config.CLAIM_STATUS[key])),
  pr_resource_id: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  issue_resource_id: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
})

const GithubResource = sequelize.define(
  'github_resource',
  {
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
    owner: {
      type: Sequelize.STRING,
      unique: 'uk_type_resource_id_project_owner',
      allowNull: false
    },
    project: {
      type: Sequelize.STRING,
      unique: 'uk_type_resource_id_project_owner',
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('OPEN', 'CLOSED', 'MERGED'),
      allowNull: false,
      defaultValue: 'OPEN'
    }
  },
  { indexes: [{ fields: ['type', 'resource_id', 'project'], unique: true }] }
)

Claim.belongsTo(GithubResource, {
  as: 'pr',
  foreignKey: 'pr_resource_id',
  allowNull: true
})

Claim.belongsTo(GithubResource, {
  as: 'issue',
  foreignKey: 'issue_resource_id',
  allowNull: true
})

GithubResource.hasMany(Claim, {
  as: 'prClaim',
  foreignKey: 'pr_resource_id'
})

GithubResource.hasMany(Claim, {
  as: 'issueClaim',
  foreignKey: 'issue_resource_id'
})

module.exports = {
  Sequelize,
  Database: sequelize,
  Claim,
  User,
  GithubResource
}
