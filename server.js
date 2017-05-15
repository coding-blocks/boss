/**
 * Created by championswimmer on 15/05/17.
 */
const express = require('express');
const bodyParser = require('body-parser');

const routes = {
    api: require('./api')
};

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.raw());

app.use('/api', routes.api);
app.get('/', (req, res) => {
    res.send('Server works')
});


app.listen(3232, function () {
    console.log("Server started on http://localhost:3232");
});