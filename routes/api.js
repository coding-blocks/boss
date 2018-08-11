/**
 * Created by championswimmer on 15/05/17.
 */
const passport = require('passport');
const Router = require('express').Router;

const auth = require('./../utils/auth');
const config = require('./../config');
const du = require('./../utils/datautils');

const route = new Router();

route.get('/claims', (req, res) => {
  const options = {
    status: req.query.status || "claimed",
    page: req.query.page || 1,
    size: req.query.size || config.PAGINATION_SIZE
  }

  du.getClaims(options).then(data => {
    res.send(data)
  }).catch(err => {
    console.log(err);
    res.status(500).send("Sorry. Could not get the claims right now.");
  });
});

route.get('/claims/:id/delete', auth.adminOnly, (req, res) => {
  du.delClaim(req.params.id).then(result => {
    res.send({result: result})
  }).catch(err => {
    console.log(err);
    res.status(500).send("Sorry. Could not delete the claim right now.");
  });
});

route.get('/claims/:id/update', auth.adminOnly, (req, res) => {
  //TODO: For authorised requests only
  du.updateClaim(req.params.id, req.query).then(result => {
    res.send({result: result})
  }).catch(err => {
    console.log(err);
    res.status(500).send("Sorry. Could not update the claim right now.");
  });
});

route.post('/claims/add', auth.ensureLoggedInGithub, (req, res) => {

  if(process.env.BOSS_DEV === 'localhost'){
    req.user = {
      usergithub:{
        username:'Dhroov7'
      }
    }
  }

  if(Date.now()>Date.UTC(2018, 07, 16, 00, 00)){
    return res.send("Sorry. Boss has ended, can't add claim from now.");
  }
  
  du.createClaim(
    req.user.usergithub.username,
    req.body.issue_url,
    req.body.pull_url,
    req.body.bounty,
    config.CLAIM_STATUS.CLAIMED
  ).then(claim => {
    res.send(claim)
  }).catch(err => {
    console.log(err);
    res.send("Sorry. Could not add the claim right now.");
  });
});


exports = module.exports = route;
