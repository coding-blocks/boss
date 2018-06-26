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
const request = require("request");

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



route.get('/', (req, res) => res.render('pages/index'));

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

        for(var i=1;i<=lastPage;i++)
            pagination.push(`?page=${i}&size=${options.size}`);

        res.render('pages/leaderboard', {
            prevPage : options.page-1,
            nextPage : options.page+1,
            isFirstPage : options.page==1,
            isLastPage : options.page == lastPage,
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

route.get('/stats', (req, res) => {
    du.getCounts().then(data => {
        res.render('pages/stats', {
            participants: data[0],
            claims: data[1],
            accepted: data[2],
            totalclaimed: data[3],
            menu: {stats: 'active'}
        });
    }).catch((error) => {
        res.send("Error fetching stats!")
    })
});

route.get('/claims/view', (req, res) => {

    const options = {
        username: req.query.username,
        projectname: req.query.projectname,
        status : req.query.status || "claimed",
        page : req.query.page || 1,
        bountyMin:req.query.bountyMin,
        bountyMax:req.query.bountyMax,
        size : req.query.size || config.PAGINATION_SIZE
    };

    var menuH = {};

    if (options.status == "claimed")
        menuH[options.status] = 'active';
    else if (options.status == "accepted")
        menuH[options.status] = 'active';
    else
        menuH[options.status] = 'active';

    options.page = parseInt(options.page);

    du.getClaims(options).then(data => {

        const pagination = [];
        const filter = [];
        const filterBounty = [];
        const filterproj = [];
        const lastPage = Math.ceil(data[1].count / options.size);

        for(var i=1;i<=lastPage;i++){
            if (options.username) {
                pagination.push(`?page=${i}&size=${options.size}&status=${options.status}&username=${options.username}`);
            }else if(options.projectname){
                pagination.push(`?page=${i}&size=${options.size}&status=${options.status}&projectname=${options.projectname}`);
            }else if(options.bounty){
                pagination.push(`?page=${i}&size=${options.size}&status=${options.status}&bountyMin=${options.bountyMin}&bountyMax=${options.bountyMax}`);
            }else{
                pagination.push(`?page=${i}&size=${options.size}&status=${options.status}`);
            }
        }

        data[0].forEach(function(item, index){
            filter.push({
                    name : item.DISTINCT,
                    url : `?status=${options.status}&username=${item.DISTINCT}`
                });
        });

        data[2].forEach(function(item, index){
            filterproj.push({
                    name : item.DISTINCT,
                    url : `?status=${options.status}&projectname=${item.DISTINCT}`
                });
        });

        data[1].rows.forEach(function (item,index) {
            filterBounty.push({
                name:item.user,
                url: `?status=${options.status}&bountyMin=${item.bountyMin}&bountyMax=${item.bountyMax}`
            })
        })

        res.render('pages/claims/view', {
            prevPage : options.page-1,
            nextPage : options.page+1,
            pagination : pagination,
            isFirstPage : options.page == 1,
            isLastPage : lastPage == options.page ,
            page : options.page ,
            size : options.size,
            claims: data[1].rows,
            menu: {
                claims_view: 'active',
                claims: 'claims-active',
            },
            status: options.status,
            menuH,
            filter : filter,
            filterproj: filterproj,
            filterBounty:filterBounty,
            username : options.username,
            projectname: options.projectname,
        })
    }).catch((err) => {
        console.log(err);
        res.send("Error fetching claims")
    })
});

route.get('/claims/add', auth.ensureLoggedInGithub, (req, res) => {
    res.render('pages/claims/add', {
        menu: {
            claims_add: 'active',
            claims: 'claims-active',
        }
    });
})

route.get('/claims/:id', auth.adminOnly,  (req, res) => {
    du.getClaimById(req.params.id).then((claim) => {
        if (!claim) throw new Error("No claim found")
        res.render('pages/claims/id', {claim})
    }).catch((err) => {
        res.send("Error fetching claim id = " + req.params.id);
    })
});

route.post('/claims/add', auth.ensureLoggedInGithub, (req, res) => {
    du.createClaim(
        req.user.usergithub.username, // github username already valid
        req.body.issue_url,
        req.body.pull_url,
        req.body.bounty,
        config.CLAIM_STATUS.CLAIMED
    ).then(claim => {
        res.redirect('/claims/view')
    }).catch((error) => {
        res.render('pages/claims/unique')
    });

});

route.post('/claims/:id/update', auth.adminOnly , (req, res) => {
    du.updateClaim(req.params.id, req.body ).then(result => {
        res.redirect('/claims/' + req.params.id);
    }).catch((error) => {
        res.send("Error updating claim")
    })
});

exports = module.exports = route;
