/**
 * Created by championswimmer on 16/05/17.
 */
const basicAuth = require('express-basic-auth')
const Sequelize = require('sequelize');
const rp = require('request-promise');
const passport = require('passport');
const Router = require('express').Router;

const auth = require('./../utils/auth');
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

route.get('/login', passport.authenticate('oauth2', { failureRedirect: '/failed' }) );
route.get('/login/callback', passport.authenticate('oauth2', { failureRedirect: '/failed' }) , (req,res)=>{
    res.redirect('/');
});

route.get('/logout', (req,res)=>{
    req.session.destroy();
    res.redirect('/');
});

route.get('/leaderboard', (req, res) => {

    const options = {
        page : req.query.page|| 1, 
        size : req.query.size || config.PAGINATION_SIZE 
    };

    options.page = parseInt(options.page);

    du.getLeaderboard(options).then(data => {

        const pagination = [];
        const count = data[0];
        const rows = data[1][0];
        const lastPage = Math.ceil(count / options.size);

        for(var i=1;i<=data.lastPage;i++)
            pagination.push(`?page=${i}&size=${options.size}`);

        res.render('pages/leaderboard', {
            prevPage : options.page-1,
            nextPage : options.page+1,
            isFirstPage : options.page==1,
            isLastPage : options.page == data.lastPage,
            size : options.size,
            page : options.page,
            pagination : pagination,
            userstats: rows,
            menu: {leaderboard: 'active'}
        })
    }).catch((error) => {
        console.log(error);
        res.send("Error fetching leaderboard")
    })
});

route.get('/claims/view', (req, res) => {

    const options = {
        status : req.query.status,
        page : req.query.page || 1,
        size : req.query.size || config.PAGINATION_SIZE
    };

    options.page = parseInt(options.page);

    du.getClaims(options).then(data => {
        const pagination = [];
        const lastPage = Math.ceil(data.count / options.size);
        for(var i=1;i<=lastPage;i++)
            pagination.push(`?page=${i}&size=${options.size}`);

        res.render('pages/claims/view', {
            prevPage : options.page-1,
            nextPage : options.page+1,
            pagination : pagination,
            isFirstPage : options.page == 1,
            isLastPage : lastPage == options.page ,
            page : options.page ,
            size : options.size,
            claims: data.rows,
            menu: {claims_view: 'active'}
        })
    }).catch((err) => {
        console.log(err);
        res.send("Error fetching claims")
    })
});

route.get('/claims/add', (req, res) => {
    res.render('pages/claims/add', {
        menu: {claims_add: 'active'}
    })
});

route.get('/claims/:id', auth.adminOnly,  (req, res) => {
    du.getClaimById(req.params.id).then((claim) => {
        res.render('pages/claims/id', {claim: claim})
    }).catch((err) => {
        res.send("Error fetching claim id = " + req.params.id);
    })
});

route.post('/claims/add', (req, res) => {
    req.body.user =  req.body.user.trim(); // strip whitespaces from start and end
    du.createClaim(
        req.body.user,
        req.body.issue_url,
        req.body.pull_url,
        req.body.bounty,
        config.CLAIM_STATUS.CLAIMED
    ).then(claim => {
        res.redirect('/claims/view')
    }).catch((error) => {
        res.send("Error adding claim")
    })
});

route.post('/claims/:id/update', auth.adminOnly , (req, res) => {
    du.updateClaim(req.params.id, req.body.status).then(result => {
        res.redirect('/claims/' + req.params.id);
    }).catch((error) => {
        res.send("Error updating claim")
    })
});


exports = module.exports = route;