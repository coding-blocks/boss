/**
 * Created by championswimmer on 15/05/17.
 */
const Router = require('express').Router;

const config = require('./../config');
const du = require('./../utils/datautils');

const route = new Router();

route.get('/claims', (req, res) => {
    du.getClaims(req.query.status).then(claims => {
        res.send(claims)
    })

});

route.get('/claims/:id/delete', (req, res) => {
    du.delClaim(req.params.id).then(result => {
        res.send({result: result})
    })
});

route.get('/claims/:id/update', (req, res) => {
    //TODO: For authorised requests only
    du.updateClaim(req.params.id, req.query.status).then(result => {
        res.send({result: result})
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
        res.send(claim)
    })
});


exports = module.exports = route;