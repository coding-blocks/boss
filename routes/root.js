/**
 * Created by championswimmer on 16/05/17.
 */
const Sequelize = require('sequelize');
const Router = require('express').Router;

const config = require('./../config');
const db = require('./../utils/db');
const du = require('./../utils/datautils');

const route = new Router();

route.get('/', (req, res) => {
    res.redirect('/leaderboard')
});

route.get('/leaderboard', (req, res) => {
    du.getLeaderboard().spread((results, meta) => {
        res.render('leaderboard', {
            userstats: results,
            menu: {leaderboard: 'active'}
        })
    })
});

route.get('/claims/view', (req, res) => {
    du.getClaims(req.query.status).then(claims => {
        res.render('claims', {
            claims: claims,
            menu: {claims_view: 'active'}
        })
    })
});

route.get('/claims/add', (req, res) => {
    res.render('addclaim', {
        menu: {claims_add: 'active'}
    })
});

route.post('/claims/add', (req, res) => {
    du.createClaim(
        req.body.user,
        req.body.issue_url,
        req.body.pull_url,
        req.body.bounty,
        config.CLAIM_STATUS.CLAIMED
    ).then(claim => {
        res.redirect('/claims/view')
    })
})


exports = module.exports = route;