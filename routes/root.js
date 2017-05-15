/**
 * Created by championswimmer on 16/05/17.
 */
const Sequelize = require('sequelize');
const Router = require('express').Router;

const config = require('./../config');
const db = require('./../utils/db');

const route = new Router();

route.get('/leaderboard', (req, res) => {
    db.query("SELECT `user`, " +
        "SUM(CASE WHEN `claim`.`status` = 'accepted' THEN `bounty` ELSE 0 END) as `bounty`, " +
        "COUNT(`bounty`) as `pulls` FROM `claims` AS `claim` " +
        "GROUP BY `user` " +
        "ORDER BY SUM(`bounty`) DESC").spread((results, meta) => {
        res.render('leaderboard', {
            userstats: results
        })
    })
});

exports = module.exports = route;