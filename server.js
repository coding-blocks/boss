/**
 * Created by championswimmer on 15/05/17.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-hbs');
const session = require('express-session');

const auth = require('./utils/auth');
const config = require('./config.json');

const routes = {
    api: require('./routes/api'),
    root: require('./routes/root')
};
const sess = {
    secret: config.secret,
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

app.locals.clientId = config.clientId;
app.locals.callbackURL = config.callbackURL;

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

app.use('/api', routes.api);
app.use(session(sess)); // let api be stateless
app.use(auth.injectAuthData);
app.use('/', routes.root);
app.use('/', express.static(path.join(__dirname, 'public_static')));

process.env.PORT = process.env.PORT || 3232;

app.listen(process.env.PORT, function () {
    console.log("Server started on http://localhost:" + process.env.PORT);
});