/**
 * Created by championswimmer on 15/05/17.
 */
const Router = require('express').Router

const auth = require('./../utils/auth')
const config = require('./../config')
const du = require('./../utils/datautils')

const { BOSS_END_DATE, BOSS_START_DATE } = require('./../utils/consts')

const route = new Router()

/**
 * @api  {get} api/claims Endpoint for operations on claim management
 * @apiVersion 0.0.3
 * @apiGroup Claims
 * @apiName List Claims
 * @apiPermission none
 * @apiDescription : This endpoint is used to populate the data on the dashboard to render the ongoing claims. It returns
 * a list of active participants, active claims, and names of projects under the BOSS contest.
 *
 * @apiExample {curl} Curl example
 * curl -i http://boss.codingblocks.com/api/claims/
 *
 * @apiSuccess (Claims) {Object[]} ArrayIndex0 Array                       containing usernames of participants
 * @apiSuccess (Claims) {Object} ArrayIndex0.Object                        Object containing username of distinct participants
 * @apiSuccess (Claims) {String} ArrayIndex0.Object.DISTINCT               Github username of participant
 *
 * @apiSuccess (Claims) {Object} ArrayIndex1                               Object containing details about currently active claims
 * @apiSuccess (Claims) {Number} ArrayIndex1.count                         total number of active claims
 * @apiSuccess (Claims) {Object[]} ArrayIndex1.rows                        array of objects containing details of active claims
 * @apiSuccess (Claims) {Object} ArrayIndex1.rows.Object object containing details about individual active claim
 * @apiSuccess (Claims) {number} ArrayIndex1.rows.Object.claim.id          unique id of the claim
 * @apiSuccess (Claims) {String} ArrayIndex1.rows.Object.claim.user        username of the participant who made the claim
 * @apiSuccess (Claims) {String} ArrayIndex1.rows.Object.claim.issueUrl    link of the issue submitted for claim
 * @apiSuccess (Claims) {String} ArrayIndex1.rows.Object.claim.pullUrl     link of the pull request submitted for claim
 * @apiSuccess (Claims) {String} ArrayIndex1.rows.Object.claim.repo        repository to which claim was made
 * @apiSuccess (Claims) {String} ArrayIndex1.rows.Object.claim.reason      reason for current status of claim
 * @apiSuccess (Claims) {Number} ArrayIndex1.rows.Object.claim.bounty      bounty to be awarded upon success
 * @apiSuccess (Claims) {String} ArrayIndex1.rows.Object.claim.status      current status of claim
 * @apiSuccess (Claims) {Date} ArrayIndex1.rows.Object.claim.createdAt     iso date timestamp of claim creation
 * @apiSuccess (Claims) {Date} ArrayIndex1.rows.Object.claim.updatedAt     iso date timestamp of claim update
 *
 * @apiSuccess (Claims) {Object[]} ArrayIndex2                              Array containing names of projects on which contributions are being made
 * @apiSuccess (Claims) {Object} ArrayIndex2.Object                         object containing github slug of projects having attached claims
 * @apiSuccess (Claims) {String} ArrayIndex2.Object.DISTINCT                github slug of a project
 *
 * @apiErrorExample {text} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     Sorry, Could not get the claims right now
 * */
route.get('/claims', (req, res) => {
  const options = {
    status: req.query.status || 'claimed',
    page: req.query.page || 1,
    size: req.query.size || config.PAGINATION_SIZE,
    merged: req.query.merged === 'true'
  }

  du.getClaims(options)
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      console.log(err)
      res.status(500).send('Sorry. Could not get the claims right now.')
    })
})

/**
 * @api  {get} api/claims/:id/delete To delete a claim
 * @apiVersion 0.0.3
 * @apiGroup Claims
 * @apiName Delete Claim
 * @apiPermission admin
 * @apiDescription This endpoint is used to delete a claim from the database. It returns the number of
 * records affected by the operation, which should be ideally 1.
 *
 * @apiParam {Number} id                id of the claim to be updated.
 *
 * @apiSuccess (Claims) {Number} integer denoting number of claims deleted
 *
 * @apiErrorExample {text} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     Sorry, Could not delete the claims right now
 * */
route.get('/claims/:id/delete', (req, res) => {
  du.delClaim(req.params.id)
    .then(result => {
      res.send({ result: result })
    })
    .catch(err => {
      console.log(err)
      res.status(500).send('Sorry. Could not delete the claim right now.')
    })
})

/**
 * @api  {get} api/claims/:id/update To update a claim
 * @apiVersion 0.0.3
 * @apiGroup Claims
 * @apiName Update Claim
 * @apiPermission admin
 * @apiDescription This endpoint is used to update an existing claim in the database. It's called from the dashboard
 * to update the status or bounty of the submission.
 * 
 * @apiParam {Number} id                id of the claim to be updated.
 * @apiParam {Number} bounty            new bounty of the claim
 * @apiParam {String} reason            to update the claim
 * @apiParam {String} status            current status of claim. has to be one of the following:claimed, accepted, rejected, disputed, revoked
 *  
 * @apiExample {curl} Curl example
 * curl -i http://boss.codingblocks.com/api/claims/2/update?bounty=100&reason=xyz&status=accepted
 *
 * @apiSuccess (Claims) {[]} result                                     array containing updated claim info
 * @apiSuccess (Claims) {number} result.ArrayIndex0                     number of rows / claims updated. should be 1 for successful update
 * @apiSuccess (Claims) {Object[]} result.ArrayIndex0 array             containing details of claims updated by operation
 * 
 * @apiSuccess (Claims) {Object}    result.ArrayIndex1 Object           object containing details about individual active claim
 * @apiSuccess (Claims) {number}    result.ArrayIndex1.claim.id          unique id of the claim
 * @apiSuccess (Claims) {String}    result.ArrayIndex1.claim.user        username of the participant who made the claim
 * @apiSuccess (Claims) {String}    result.ArrayIndex1.claim.issueUrl    link of the issue submitted for claim
 * @apiSuccess (Claims) {String}    result.ArrayIndex1.claim.pullUrl     link of the pull request submitted for claim
 * @apiSuccess (Claims) {String}    result.ArrayIndex1.claim.repo        repository to which claim was made
 * @apiSuccess (Claims) {String}    result.ArrayIndex1.claim.reason      reason for current status of claim
 * @apiSuccess (Claims) {Number}    result.ArrayIndex1.claim.bounty      bounty to be awarded upon success
 * @apiSuccess (Claims) {String}    result.ArrayIndex1.claim.status      current status of claim
 * @apiSuccess (Claims) {Date}      result.ArrayIndex1.claim.createdAt   iso date timestamp of claim creation
 * @apiSuccess (Claims) {Date}      result.ArrayIndex1.claim.updatedAt   iso date timestamp of claim update

 * 
 * 
 * @apiErrorExample {text} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     Sorry, Could not update the claims right now
 * */
route.get('/claims/:id/update', auth.adminOnly, (req, res) => {
  du.updateClaim(req.params.id, req.query)
    .then(result => {
      res.send({ result: result })
    })
    .catch(err => {
      console.log(err)
      res.status(500).send('Sorry. Could not update the claim right now.')
    })
})

/**
 * @api  {get} api/claims/add To add a new claim
 * @apiVersion 0.0.3
 * @apiGroup Claims
 * @apiName Add New Claim
 * @apiPermission github
 * @apiDescription This endpoint is used to add new claims for bounties from the participant dashboard.
 *
 * @apiParam {String} issue_url         id of the claim to be updated.
 * @apiParam {String} pull_url          new bounty of the claim
 * @apiParam {Number} bounty            to update the claim
 *
 * @apiSuccess (Claims) {Object} claim containing details of newly created claim
 * @apiSuccess (Claims) {number}    claim.id          unique id of the claim
 * @apiSuccess (Claims) {String}    claim.user        username of the participant who made the claim
 * @apiSuccess (Claims) {String}    claim.issueUrl    link of the issue submitted for claim
 * @apiSuccess (Claims) {String}    claim.pullUrl     link of the pull request submitted for claim
 * @apiSuccess (Claims) {String}    claim.repo        repository to which claim was made
 * @apiSuccess (Claims) {String}    claim.reason      reason for current status of claim
 * @apiSuccess (Claims) {Number}    claim.bounty      bounty to be awarded upon success
 * @apiSuccess (Claims) {String}    claim.status      current status of claim
 * @apiSuccess (Claims) {Date}      claim.createdAt     iso date timestamp of claim creation
 * @apiSuccess (Claims) {Date}      claim.updatedAt     iso date timestamp of claim update
 *
 * @apiErrorExample {text} Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     Sorry, Could not addd the claims right now
 * */
route.post('/claims/add', (req, res) => {
  if (process.env.BOSS_DEV === 'localhost') {
    req.user = {
      usergithub: {
        username: 'Dhroov7'
      }
    }
  }

  if (Date.now() > BOSS_END_DATE.getTime()) {
    return res.send("Sorry. Boss has ended, can't add claim from now.")
  }
  if (Date.now() < BOSS_START_DATE.getTime()) {
    return res.send('Sorry. BOSS has not yet started')
  }

  if (
    !req.body.issue_url.match(/^https:\/\/github.com\/[^\/]*\/[^\/]*\/issues\/[0-9]*$/) ||
    !req.body.pull_url.match(/^https:\/\/github.com\/[^\/]*\/[^\/]*\/(issues|pull)\/[0-9]*$/)
  ) {
    process.exit()
    console.log('Bad Url')
    return res.status(400).send('Bad url')
  }

  du.createClaim(
    req.user.usergithub.username,
    req.body.issue_url,
    req.body.pull_url,
    req.body.bounty,
    config.CLAIM_STATUS.CLAIMED
  )
    .then(claim => {
      res.send(claim)
    })
    .catch(err => {
      console.log(err)
      res.send('Sorry. Could not add the claim right now.')
    })
})

module.exports = route
