/**
 * Created by abhishek on 17/05/17.
 */
'use strict';

// This file conatins middleware utils for auth and role implementation

const rp = require('request-promise');
const db = require('./db');
const du = require('./datautils');
const config = require('./../config');

module.exports = {
  injectAuthData(req,res,next){
      if(req.user) {
          res.locals.isAuthenticated = true;
          res.locals.user = req.user;
      } else {
          res.locals.isAuthenticated = false;
      }
      next();
  },
  adminOnly(req,res,next){
    if(config.TEST_MODE){
      next();
    }
    if( (req.user && req.user.role === 'admin') || (process.env.BOSS_DEV === 'localhost'))
          next();
      else
          res.render('error' , {error : 'Admin Access Only!'});
  },
    checkToken(token,done){
      //check if token is of an admin user

      rp({
          uri : 'https://account.codingblocks.com/api/users/me',
          headers : {
              'Authorization' : `Bearer ${token}`
          },
          json : true
      }).then(data=>{
        return db.User.findOne({ where : {id : data.id } });
      }).then(user=>{
          if(user.role === 'admin')
              done(null,user);
          else
              done('Unauthroized');
      }).catch(err=>{
          done('Unauthroized');
      });

  },
    oauth2Success(accessToken, refreshToken, profile, cb) {
        console.log(accessToken , refreshToken , profile);
        return rp({
            uri    : 'https://account.codingblocks.com/api/users/me',
            qs : {
                include : 'github'
            },
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            json   : true
        }).then( data=>{
            const user = db.User.findOrCreate({
                where : { oneauthId : data.id },
                defaults : { role : 'user'}
            });

            return user.spread((userDB, created) => {
                data.role = userDB.role;
                return cb(null,data);

            });
        });
    },
  ensureLoggedInGithub(req, res, next){
    // check is user is logged in and has github linked
      if((req.user && req.user.usergithub) || (process.env.BOSS_DEV === 'localhost')) {
          next()
      } else {
          res.render('error',{error: 'You need to be logged in for this. Also make sure you have linked your github account at account.codingblocks.com'})
      }
  },
  ensureUserCanEdit(req, res, next) {
      // check if the user is claimer of the claim
      du.getClaimById(req.params.id)
          .then(claim => {
              if (!claim) throw new Error('No claim found')
              if (claim.user === req.user.usergithub.username) {
                  next()
              }
              else {
                  res.render('error', {error: 'You are not authorized to edit this claim..'})
              }
          })
          .catch(err => {
              res.send('Error fetching claim id = ' + escapeHtml(req.params.id))
          })
  }
};
