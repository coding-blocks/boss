/**
 * Created by championswimmer on 15/05/17.
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-hbs');

const routes = {
    api: require('./routes/api'),
    root: require('./routes/root')
};

const app = express();

app.engine('hbs', exphbs.express4({
    partialsDir: path.join(__dirname, 'views/partials'),
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout: 'views/layouts/main.hbs',
}));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "hbs");

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
app.use('/', routes.root);
app.use('/', express.static(path.join(__dirname, 'public_static')));


app.listen(process.env.PORT, function () {
    console.log("Server started on http://localhost:" + process.env.PORT);
});