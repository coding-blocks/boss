/**
 * Created by championswimmer on 16/05/17.
 */
const db = require('./db')
const fs = require('fs')
const consts = require('./consts')
const {Op} = require('sequelize')

function getContestPeriod(year) {
  if (year)
    return {
      start_date: consts[`BOSS_${year}_START_DATE`].toISOString(),
      end_date: consts[`BOSS_${year}_END_DATE`].toISOString()
    }

  return {
    start_date: consts.BOSS_START_DATE.toISOString(),
    end_date: consts.BOSS_END_DATE.toISOString()
  }
}

function getClaims(options) {
  const offset = (options.page - 1) * options.size

  const period = getContestPeriod()
  const baseClause = { status: options.status, createdAt: { $between: [period.start_date, period.end_date] } }
  const whereClause = { ...baseClause }
  if (options.username) {
    whereClause.user = options.username
  } else if (options.projectname) {
    whereClause.repo = options.projectname
  } else if (options.minbounty && options.maxbounty) {
    whereClause.bounty = { $between: [options.minbounty, options.maxbounty] }
  }

  const distinctUsers = db.Claim.aggregate('user', 'DISTINCT', { plain: false, where: baseClause })
  const distinctProjects = db.Claim.aggregate('repo', 'DISTINCT', { plain: false, where: baseClause })
  const allClaims = db.Claim.findAndCountAll({
    limit: options.size,
    offset: offset,
    where: whereClause,
    order: [['updatedAt', 'DESC']],
    include: [
      {
        model: db.GithubResource,
        as: 'pr',
        ...(options.merged
          ? {
              where: { type: 'PULL_REQUEST', status: 'MERGED' },
              required: true
            }
          : {})
      },
      { model: db.GithubResource, as: 'issue' }
    ]
  })

  return Promise.all([distinctUsers, allClaims, distinctProjects])
}

function getClaimById(claimId) {
  return db.Claim.findById(claimId, {
    include: [
      { model: db.GithubResource, as: 'pr' },
      { model: db.GithubResource, as: 'issue' }
    ]
  })
}

function getAllAdmins() {
  return db.User.findAll({
    where: {
      role: 'admin',
    }
  })
}

function makeUserAdmin(oneauthId) {
  return db.User.update(
    {
      role: 'admin'
    },
    {
      where: {
        oneauthId: oneauthId
      },
      returning: true
    }
  )
}

function getUserByOneAuthId(oneauthId) {
  return db.User.findOne({
    where: {
      oneauthId: oneauthId
    }
  })
}

function delClaim(claimId) {
  if (isNaN(+claimId)) {
    return res.send('ClaimId must be a number')
  }
  return db.Claim.destroy({
    where: {
      id: claimId
    }
  })
}

function getConflictedClaims(claim,issueUrlDetail,pullUrlType) {
  projectName = '/' + issueUrlDetail.project + '/'
  issueId = '/' + issueUrlDetail.id
  pullUrlType = projectName + pullUrlType + '/'
  return db.Claim.findAll({
    where : {
      [Op.and] : [
        {
          [Op.or] : [
            { issueUrl: { [Op.like]: '%' + projectName + '%' + issueId } },
            { issueUrl: { [Op.like]: '%' + projectName + '%' + issueId + '/' } }
          ]
        },
        { pullUrl: { [Op.like]: '%' + pullUrlType + '%' } },
        { id : { [Op.ne] : claim.id } }
      ]
    }
  })
}

function updateClaim(claimId, { status, reason, bounty }) {
  const claim = {
    action: 'update',
    claimId,
    status,
    bounty
  }
  fs.writeFile(__dirname + '/../audit/' + new Date().toISOString() + '.json', JSON.stringify(claim), () => {})

  return db.Claim.update(
    {
      status: status,
      reason: reason,
      bounty: bounty
    },
    {
      where: {
        id: claimId
      },
      returning: true
    }
  )
}

function getGithubResource(url) {
  const meta = getResourceFromUrl(url)

  return db.GithubResource.findOne({
    where: {
      owner: meta.owner,
      project: meta.repo,
      type: meta.type,
      resource_id: meta.id
    }
  })
}

async function createClaim(user, issueUrl, pullUrl, bounty, status) {
  const claim = {
    action: 'create',
    user,
    issueUrl,
    pullUrl,
    bounty,
    status
  }
  fs.writeFile(__dirname + '/../audit/' + new Date().toISOString() + '.json', JSON.stringify(claim), () => {})

  const [pr, issue] = await Promise.all([getGithubResource(pullUrl), getGithubResource(issueUrl)])

  return db.Claim.create({
    user,
    issueUrl,
    pullUrl,
    repo: pullUrl.split('github.com/')[1].split('/')[1],
    bounty: bounty,
    pr_resource_id: pr && pr.id,
    issue_resource_id: issue && issue.id,
    status: status
  })
}

async function getLoggedInUserStats(options = {}, username) {
  const period = getContestPeriod(options.year)

  const result = await db.Database.query(`with RankTable as (
        SELECT "user",
              SUM(CASE WHEN "claim"."status" = 'accepted' THEN "bounty" ELSE 0 END) as "bounty",
              COUNT("bounty") as "pulls",
              ROW_NUMBER() OVER(ORDER BY SUM(CASE WHEN "claim"."status" = 'accepted' THEN "bounty" ELSE 0 END) DESC, COUNT("bounty") DESC) as rank
              FROM "claims" AS "claim"
              where "createdAt" between '${period.start_date}' and '${period.end_date}'
              GROUP BY "user"
              ORDER BY "bounty" DESC, "pulls" DESC
            )
        SELECT RankTable.* from RankTable where RankTable.user = '${username}'`)

  return result
}
function getLeaderboard(options = {}) {
  options.size = parseInt(options.size || 0)
  const offset = (options.page - 1) * options.size
  const period = getContestPeriod(options.year)

  const userCount = db.Claim.aggregate('user', 'count', {
    distinct: true,
    where: {
      createdAt: {
        $between: [period.start_date, period.end_date]
      }
    }
  })

  const results = db.Database.query(`SELECT "user",
        SUM(CASE WHEN "claim"."status" = 'accepted' THEN "bounty" ELSE 0 END) as "bounty",
        COUNT("bounty") as "pulls",
        ROW_NUMBER() OVER(ORDER BY SUM(CASE WHEN "claim"."status" = 'accepted' THEN "bounty" ELSE 0 END) DESC, COUNT("bounty") DESC) as rank
        FROM "claims" AS "claim"
        where "createdAt" between '${period.start_date}' and '${period.end_date}'
        GROUP BY "user"
        ORDER BY "bounty" DESC, "pulls" DESC
        LIMIT ${options.size} OFFSET ${offset}`)

  return Promise.all([userCount, results])
}

function getCounts() {
  const where = {
    createdAt: {
      $between: [getContestPeriod().start_date, getContestPeriod().end_date]
    }
  }

  const participants = db.Claim.aggregate('user', 'count', { distinct: true, where })
  const claims = db.Claim.aggregate('*', 'count', { where })
  var accepted = db.Claim.aggregate('bounty', 'sum', {
    where: {
      status: 'accepted',
      ...where
    }
  })
  var totalclaimed = db.Claim.aggregate('bounty', 'sum', { where })

  var filterNaN = data => data || 0

  var counts = Promise.all([participants, claims, accepted, totalclaimed]).then(values => values.map(filterNaN))

  return counts
}

const getResourceFromUrl = url => {
  if (!url.match(/^https:\/\/github.com\/[^\/]*\/[^\/]*\/(issues|pull)\/[0-9]*\/?$/))
    throw new Error('Unsupported URL provided')

  const [owner, repo, type, id] = url.replace('https://github.com/', '').split('/')

  return {
    owner: owner.toLowerCase(),
    repo: repo.toLowerCase(),
    type: type === 'issues' ? 'ISSUE' : 'PULL_REQUEST',
    id: Number(id)
  }
}

module.exports = {
  getClaims,
  delClaim,
  createClaim,
  getLeaderboard,
  getLoggedInUserStats,
  getClaimById,
  updateClaim,
  getCounts,
  getResourceFromUrl,
  getAllAdmins,
  makeUserAdmin,
  getUserByOneAuthId,
  getConflictedClaims,
}
