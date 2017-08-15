const mocha = require('mocha')
  , chai = require('chai')
  , chaiHttp = require('chai-http')
  , expect = chai.expect
  , should = chai.should();

chai.use(chaiHttp)
const api = chai.request("http://localhost:8000/api")

it("Status code is 404", (done) => {
  api.get('/').end((err, res) => {
    res.statusCode.should.equal(404);
    res.text.should.contain('Cannot GET /api/');
    done()
  });
});

it("Add new claim", (done) => {
  api.post('/claims/add').send({
    user: 'bhavyaagg',
    issue_url: 'https://github.com/coding-blocks/shortlr/issues/59',
    pull_url: 'https://github.com/coding-blocks/shortlr/pull/60',
    bounty: 500,
  }).end((err, res) => {
    res.statusCode.should.equal(200);
    res.body.id.should.equal(1);
    res.body.user.should.equal('bhavyaagg');
    res.body.repo.should.equal('shortlr');
    res.body.bounty.should.equal(500);
    res.body.status.should.equal('claimed');
    res.body.issueUrl.should.equal('https://github.com/coding-blocks/shortlr/issues/59');
    res.body.pullUrl.should.equal('https://github.com/coding-blocks/shortlr/pull/60');
    done()
  });
});

it("Get claims", (done) => {
  api.get('/claims').end((err, res) => {
    res.statusCode.should.equal(200);
    res.body[1].count.should.equal(1);
    res.body[1].rows[0].id.should.equal(1);
    res.body[1].rows[0].user.should.equal('bhavyaagg');
    res.body[1].rows[0].repo.should.equal('shortlr');
    res.body[1].rows[0].bounty.should.equal(500);
    res.body[1].rows[0].status.should.equal('claimed');
    res.body[1].rows[0].issueUrl.should.equal('https://github.com/coding-blocks/shortlr/issues/59');
    res.body[1].rows[0].pullUrl.should.equal('https://github.com/coding-blocks/shortlr/pull/60');
    done()
  });
});

it("Update claim", (done) => {
  api.get('/claims/1/update?status=accepted').end((err, res) => {
    res.statusCode.should.equal(200);
    res.body.result[0].should.equal(1);
    res.body.result[1][0].status.should.equal('accepted');
    done();
  });
});

it("Delete claim", (done) => {
  api.get('/claims/1/delete').end((err, res) => {
    res.statusCode.should.equal(200);
    res.body.result.should.equal(1);
    done();
  });
});