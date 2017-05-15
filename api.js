/**
 * Created by championswimmer on 15/05/17.
 */
const Router = require('express').Router;

const config = require('./config');
const db = require('./db');

const route = new Router();

route.get('/claims', (req, res) => {
    db.Claim.findAll({
        status: req.query.status
    }).then(claims => {
        res.send(claims)
    })

});

route.get('/claims/:id/delete', (req, res) => {
    db.Claim.destroy({
        where: {
            id: req.params.id
        }
    }).then(result => {
        res.send({result: result})
    })
});

route.get('/claims/:id/update', (req, res) => {
    db.Claim.update({
        status: req.query.status
    }, {
        where: {
            id: req.params.id
        }
    }).then(result => {
        res.send({result: result})
    })
});

route.post('/claims/add', (req, res) => {
    db.Claim.create({
        user: req.body.user,
        issueUrl: req.body.issueUrl,
        pullUrl: req.body.pullUrl,
        repo: req.body.pullUrl.split('github.com/')[1].split('/')[1],
        bounty: req.body.bounty,
        status: config.CLAIM_STATUS.CLAIMED
    }).then(claim => {
        res.send(claim)
    })
});


exports = module.exports = route;