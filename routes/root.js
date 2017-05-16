/**
 * Created by championswimmer on 16/05/17.
 */
const basicAuth = require('express-basic-auth')
const Sequelize = require('sequelize');
const Router = require('express').Router;

const config = require('./../config');
const db = require('./../utils/db');
const du = require('./../utils/datautils');


const route = new Router();

let adminUser = process.env.BOSS_ADMIN || 'theboss';
let adminPass = process.env.BOSS_PASSWORD || 'khuljasimsim';
let users = {};
users[adminUser] = adminPass;

const authHandler = basicAuth({
    users: users,
    challenge: true,
    realm: 'BOSS Mentor Access Area'
});

route.get('/', (req, res) => {
    res.redirect('/leaderboard')
});

route.get('/leaderboard', (req, res) => {
    du.getLeaderboard().spread((results, meta) => {
        res.render('pages/leaderboard', {
            userstats: results,
            menu: {leaderboard: 'active'}
        })
    })
});

route.get('/claims/view', (req, res) => {

    const options = {
        status : req.query.status,
        page : req.query.page || 1,
        size : req.query.size || config.PAGINATION_SIZE
    };

    options.page = parseInt(options.page);

    du.getClaims(options).then( data => {
        const pagination = [];
        for(var i=1;i<=data.lastPage;i++)
            pagination.push(`?page=${i}&size=${options.size}`);

        res.render('pages/claims/view', {
            prevPage : options.page-1,
            nextPage : options.page+1,
            pagination : pagination,
            isFirstPage : options.page == 1,
            isLastPage : data.lastPage == options.page ,
            page : options.page ,
            size : options.size,
            claims: data.claims,
            menu: {claims_view: 'active'}
        })
    })
});

route.get('/claims/add', (req, res) => {
    res.render('pages/claims/add', {
        menu: {claims_add: 'active'}
    })
});

route.get('/claims/:id', authHandler,  (req, res) => {
    du.getClaimById(req.params.id).then((claim) => {
        res.render('pages/claims/id', {claim: claim})
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
});

route.post('/claims/:id/update', authHandler, (req, res) => {
    du.updateClaim(req.params.id, req.body.status).then(result => {
        res.redirect('/claims/' + req.params.id);
    })
});


exports = module.exports = route;