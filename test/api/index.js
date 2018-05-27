const mocha = require('mocha')
  , chai = require('chai')
  , chaiHttp = require('chai-http')
  , expect = chai.expect
  , should = chai.should()
  , assert = require('assert');

  chai.use(chaiHttp)
  const api = chai.request("http://localhost:3232/api")

  it("Status code is 404", (done) => {
    api.get('/').end((err, res) => {
      if(!err)
        assert.equal(404, res.statusCode);
        //res.text.should.contain('Cannot GET /api/');
      done();
    });
  });

it("Add new claim", (done) => {
  api.post('/claims/add').send({
    user: 'S2606',
    issue_url: 'https://github.com/coding-blocks/boss/issues/59',
    pull_url: 'https://github.com/coding-blocks/boss/pull/60',
    bounty: 500,
  }).end((err, res) => {
    if(!err)
    {
      assert.equal(200, res.statusCode);
      assert.equal(1, res.body.id);
      assert.equal('S2606', res.body.user);
      assert.equal('boss', res.body.repo);
      assert.equal(500, res.body.bounty);
      assert.equal('claimed', res.body.status);
      assert.equal('https://github.com/coding-blocks/boss/issues/59', res.body.issueUrl);
      assert.equal('https://github.com/coding-blocks/boss/pull/60', res.body.pullUrl);

    }
    done();
  });
});

it("Get claims", (done) => {
  api.get('/claims').end((err, res) => {
    if(!err)
    {
      assert.equal(200, res.statusCode);
      assert.equal(1, res.body[1].count);
      assert.equal(1, res.body[1].rows[0]);
      assert.equal('S2606', res.body[1].rows[0].user);
      assert.equal('boss', res.body[1].rows[0].repo);
      assert.equal(500, res.body[1].rows[0].bounty);
      assert.equal('claimed', res.body[1].rows[0].status);
      assert.equal('https://github.com/coding-blocks/boss/issues/59', res.body[1].rows[0].issueUrl);
      assert.equal('https://github.com/coding-blocks/boss/pull/60', res.body[1].rows[0].pullUrl);
    }
    done();
  });
});

it("Update claim", (done) => {
  api.get('/claims/1/update?status=accepted').end((err, res) => {
    if(!err)
    {
      assert.equal(200, res.statusCode);
      assert.equal(1, res.body.result[0]);
      assert.equal('accepted', res.body.result[1][0].status);

    }
    done();
  });
});

it("Delete claim", (done) => {
  api.get('/claims/1/delete').end((err, res) => {
    if(!err)
    {
      assert.equal(200, res.statusCode);
      assert.equal(1, res.body.result);

    }
    done();
  });
});
