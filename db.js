/**
 * Created by championswimmer on 15/05/17.
 */
const Sequelize = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(process.env.DATABASE_URL);

const Claim = sequelize.define('claim', {
    id: {
        type: Sequelize.TYPE_INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user: Sequelize.STRING,
    issueUrl: Sequelize.TYPE_STRING,
    pullUrl: {type: Sequelize.TYPE_STRING, unique: true},
    repo: Sequelize.TYPE_STRING,
    bounty: Sequelize.TYPE_INTEGER,
    status: Sequelize.ENUM(Object.keys(config.CLAIM_STATUS).map((key) => config.CLAIM_STATUS[key]))
});

exports = module.exports = {
    Claim
};