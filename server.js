/**
 * Created by championswimmer on 15/05/17.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-hbs');
const passport = require('./auth/passportStrategies');
const session = require('express-session');

const auth = require('./utils/auth');
const secrets = require('./secrets.json');

const routes = {
    api: require('./routes/api'),
    root: require('./routes/root')
};
const sess = {
    secret: secrets.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {}
};

const app = express();


if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
}

app.engine('hbs', exphbs.express4({
    partialsDir: path.join(__dirname, 'views/partials'),
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout: 'views/layouts/main.hbs',
}));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "hbs");

app.locals.clientId = secrets.clientId;
app.locals.callbackURL = secrets.callbackURL;

exphbs.registerHelper('equal', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if( lvalue!=rvalue ) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

exphbs.registerHelper('add', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
   return parseInt(lvalue) + parseInt(rvalue) ;
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.raw());


app.use(session(sess)); // let api be stateless

//initialize passport
app.use(passport.initialize());
app.use(passport.session());


app.use('/api', routes.api);
app.use(auth.injectAuthData);
app.use('/', routes.root);
app.use('/', express.static(path.join(__dirname, 'public_static')));

exports = module.exports = {
    app
};
