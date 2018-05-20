/**
 * Created by abhishek on 20/05/17.
 */
'use strict';

const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

const secrets = require('../secrets.json');
const auth = require('../utils/auth');


passport.use(new OAuth2Strategy({
        authorizationURL: 'https://account.codingblocks.com/oauth/authorize',
        tokenURL: 'https://account.codingblocks.com/oauth/token',
        clientID: secrets.clientId,
        clientSecret: secrets.clientSecret,
        callbackURL: secrets.callbackURL
    }, auth.oauth2Success
));

passport.use(new BearerStrategy(auth.checkToken));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

module.exports = passport ;
