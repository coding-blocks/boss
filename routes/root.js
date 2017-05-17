/**
 * Created by championswimmer on 16/05/17.
 */
const basicAuth = require('express-basic-auth')
const Sequelize = require('sequelize');
const rp = require('request-promise');
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

route.get('/login/callback',(req,res)=>{
    const code = req.query.code;

    // prepare a POST request to the oneauth api
    const options = {
        method: 'POST',
        uri: 'https://account.codingblocks.com/oauth/token',
        body: {
            client_id: config.clientId,
            redirect_uri : config.callbackURL,
            client_secret : config.clientSecret,
            grant_type : 'authorization_code',
            code : code
        },
        json: true
    };

    let error ;

    rp(options).then(data=>{
        //get access_token
        if(data.access_token) {
            req.session.accessToken = data.access_token;
            req.session.user = du.findOrCreateUser(data.access_token);
        } else {
            error = 'Unable to Authenticate, 401';
        }
    }).catch(err=>{
        error = err;
    }).finally(function () {
        if(error){
            res.render('error', {error});
        } else {
            req.session.user.then(user=> {
                req.session.user = user;
                res.redirect('/');
            });
        }
    });
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
            userstats: data.results,
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

route.get('/claims/:id', auth.adminOnly,  (req, res) => {
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

route.post('/claims/:id/update', auth.adminOnly , (req, res) => {
    du.updateClaim(req.params.id, req.body.status).then(result => {
        res.redirect('/claims/' + req.params.id);
    })
});


exports = module.exports = route;