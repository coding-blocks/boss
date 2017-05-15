/**
 * Created by championswimmer on 16/05/17.
 */
const Router = require('express').Router;

const route = new Router();

route.get('/leaderboard', (req, res) => {
    res.render('leaderboard')
});

exports = module.exports = route;