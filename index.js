const app = require('./server').app
const db = require('./utils/db').Database

db.sync({ force: false }).then(() => {
  console.log('Database configured')

  process.env.PORT = process.env.PORT || 3232
  app.listen(process.env.PORT, function () {
    console.log('Server started on http://localhost:' + process.env.PORT)
  })
})
