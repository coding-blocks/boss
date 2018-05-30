const mocha = require('mocha');
//process.env.DATABASE_URL = "test db here"

const app = require('./../server').app
  , db = require('./../utils/db').Database;

function importTest(name, path) {
  describe(name, function () {
    require(path);
  });
}

before(function (done) {
  db.sync({force: true}).then(() => {
    console.log("DB configured for tests")
    app.listen(3232, () => done())
  })
})

describe("/api", function () {
  before(function () {
    console.info("Running API test");
  });
  importTest("/", './api/index.js');
  after(function () {
    console.info("All API tests have run");
  });
});

describe("Database", function () {
  beforeEach(function () {
    console.log("Running API test");
  });
  //importTest("/", './api/index.js');
  after(function () {
    console.log("All API tests have run");
  });
});
