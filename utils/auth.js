/**
 * Created by abhishek on 17/05/17.
 */
'use strict';
 
// This file conatins middleware utils for auth and role implementation

const rp = require('request-promise');
const db = require('./db');
const config = require('./../config.json');

module.exports = {
  injectAuthData(req,res,next){
      if(req.session.user) {
          res.locals.isAuthenticated = true;
          res.locals.user = req.session.user;
      } else {
          res.locals.isAuthenticated = false;
      }
      next();
  },
  adminOnly(req,res,next){
      if( req.session.user && req.session.user.role === 'admin')
          next();
      else
          res.render('error' , {error : 'Admin Access Only!'});
  },
  adminOnlyApi(req,res,next){
      //check if token is of an admin user
      if( req.get('Authorization') ) {
          rp({
              uri : 'https://account.codingblocks.com/api/users/me',
              headers : {
                  'Authorization' : req.get('Authorization')
              },
              json : true
          }).then(data=>{
            return db.User.findOne({ where : {id : data.id } });
          }).then(user=>{
              if(user.role === 'admin')
                  next();
              else
                  res.sendStatus(401);
          }).catch(err=>{
              console.error(err);
              res.sendStatus(500);
          });

      } else {
          res.sendStatus(401);
      }
  }  
};