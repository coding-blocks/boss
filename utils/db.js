/**
 * Created by championswimmer on 15/05/17.
 */
const Sequelize = require('sequelize');
const config = require('./../config');


const sequelize = process.env.DATABASE_URL ?
    new Sequelize(process.env.DATABASE_URL) :

    new Sequelize(
        process.env.BOSS_DB_NAME || 'boss',
        process.env.BOSS_DB_USER || 'boss',
        process.env.BOSS_DB_PASS || 'boss',
        {
            host: 'localhost',
            dialect: 'postgres',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },
        });

const User = sequelize.define('user',{
    id : {
         type      : Sequelize.INTEGER,
         primaryKey: true,
        autoIncrement: true
    },
    oneauthId : Sequelize.STRING,
    role : Sequelize.ENUM(['admin','user'])
});

const Claim = sequelize.define('claim', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user: Sequelize.STRING,
    issueUrl: Sequelize.STRING,
    pullUrl: {type: Sequelize.STRING, unique: true},
    repo: Sequelize.STRING,
    reason: Sequelize.STRING,
    bounty: Sequelize.INTEGER,
    status: Sequelize.ENUM(Object.keys(config.CLAIM_STATUS).map((key) => config.CLAIM_STATUS[key]))
});





exports = module.exports = {
    Database: sequelize,
    Claim,
    User
};