let secrets = require('./secrets-sample.json')

if (process.env.NODE_ENV === 'production') {
  secrets = require('./secrets.json')
  if (!secrets) {
    throw new Error(`Cannot run unless you create secrets.json in the root.
    (Copy from secrets-sample.json and modify)`)
  }
}

module.exports = {
  secrets,
  CLAIM_STATUS: {
    CLAIMED: 'claimed',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    DISPUTED: 'disputed',
    REVOKED: 'revoked'
  },
  PAGINATION_SIZE: 10,
  TEST_MODE: false,
  development: {
    username: process.env.BOSS_DB_USER || 'postgres',
    password: process.env.BOSS_DB_PASS || 'postgres',
    database: process.env.BOSS_DB_NAME || 'boss',
    host: secrets.BOSS_DB_HOST || 'localhost',
    port: process.env.BOSS_DB_PORT || 5432,
    dialect: 'postgres',
    maxConcurrentQueries: 100,
    pool: { maxConnections: 5, maxIdleTime: 30 },
    language: 'en',
    alter: false,
    logging: false
  },
  test: {
    username: process.env.BOSS_DB_USER || 'postgres',
    password: process.env.BOSS_DB_PASS || 'postgres',
    database: process.env.BOSS_DB_NAME || 'boss',
    host: secrets.BOSS_DB_HOST || 'localhost',
    port: process.env.BOSS_DB_PORT || 5432,
    dialect: 'postgres',
    maxConcurrentQueries: 100,
    pool: { maxConnections: 5, maxIdleTime: 30 },
    language: 'en',
    logging: false
  },
  production: {
    username: process.env.BOSS_DB_USER || 'postgres',
    password: process.env.BOSS_DB_PASS || 'postgres',
    database: process.env.BOSS_DB_NAME || 'boss',
    host: secrets.BOSS_DB_HOST || 'localhost',
    port: process.env.BOSS_DB_PORT || 5432,
    dialect: 'postgres',
    maxConcurrentQueries: 100,
    pool: { maxConnections: 5, maxIdleTime: 30 },
    language: 'en',
    logging: false
  }
}
