/**
 * Created by championswimmer on 16/05/17.
 */
const Sequelize = require('sequelize');
const Router = require('express').Router;

const config = require('./../config');
const db = require('./../utils/db');

const route = new Router();

route.get('/leaderboard', (req, res) => {
    db.Claim.findAll({
        attributes: [
            'user',
            [Sequelize.fn('SUM', Sequelize.col('bounty')), 'totalbounty'],
            // [Sequelize.fn('COUNT', Sequelize.col('bounty')), 'pulls']
        ],
        group: 'user',
        where: {
            status: config.CLAIM_STATUS.ACCEPTED
        },
        order: [
            ['totalbounty', 'DESC']
        ],
        raw: true
    }).then(results => {
        res.render('leaderboard', {
            userstats: results
        })
    })
});

exports = module.exports = route;