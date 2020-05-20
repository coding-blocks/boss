/**
 * Created by championswimmer on 15/05/17.
 */
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const exphbs = require('express-hbs')
const passport = require('./auth/passportStrategies')
const session = require('express-session')
const csurf = require('csurf')

const auth = require('./utils/auth')
const config = require('./config')
const secrets = config.secrets

const routes = {
  api: require('./routes/api'),
  root: require('./routes/root')
}
const sess = {
  secret: secrets.secret,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 86400000, secure: false, httpOnly: false }
}

const app = express()

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
}

app.engine(
  'hbs',
  exphbs.express4({
    partialsDir: path.join(__dirname, 'views/partials'),
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout: 'views/layouts/main.hbs'
  })
)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.locals.clientId = secrets.clientId
app.locals.callbackURL = secrets.callbackURL

exphbs.registerHelper('equal', function(lvalue, rvalue, options) {
  if (arguments.length < 3)
    throw new Error('Handlebars Helper equal needs 2 parameters')
  if (lvalue != rvalue) {
    return options.inverse(this)
  } else {
    return options.fn(this)
  }
})

exphbs.registerHelper('add', function(lvalue, rvalue, options) {
  if (arguments.length < 3)
    throw new Error('Handlebars Helper equal needs 2 parameters')
  return parseInt(lvalue) + parseInt(rvalue)
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.raw())

app.use(session(sess)) // let api be stateless

//initialize passport
app.use(passport.initialize())
app.use(passport.session())

// Prefent CSRF
// app.use(csurf({ cookie: true }))

app.use('/api', routes.api)
app.use(auth.injectAuthData)
app.use('/', routes.root)
app.use('/', express.static(path.join(__dirname, 'public_static')))
app.get('*', (req, res) => res.render('pages/404'))

module.exports = {
  app
}
