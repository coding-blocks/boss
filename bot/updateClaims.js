const { Octokit } = require('@octokit/rest')
const db = require('../utils/db')
const { getResourceFromUrl } = require('../utils/datautils')
const secrets = require('../secrets')

const octokit = new Octokit({
  auth: secrets.GITHUB_PRS_TOKEN
})

const assignIssueResource = async claim => {
  const meta = getResourceFromUrl(claim.issueUrl)
  try {
    const resource = await db.GithubResource.findOne({
      where: {
        type: 'ISSUE',
        resource_id: meta.id,
        owner: meta.owner,
        project: meta.repo
      }
    })

    if (resource) {
      claim.issue_resource_id = resource.id
      return await claim.save()
    }

    const { data: issue } = await octokit.issues.get({
      owner: meta.owner,
      repo: meta.repo,
      issue_number: meta.id
    })

    if (!issue) return

    const [issueResource] = await db.GithubResource.upsert(
      {
        type: 'ISSUE',
        status: !!issue.closed_at ? 'CLOSED' : 'OPEN',
        resource_id: issue.number,
        owner: meta.owner,
        project: meta.repo
      },
      { returning: true }
    )

    claim.issue_resource_id = issueResource.id
    return await claim.save()
  } catch (err) {
    console.log(claim.toJSON(), meta, err)
  }
}

const assignPRResource = async claim => {
  const meta = getResourceFromUrl(claim.pullUrl)
  try {
    const resource = await db.GithubResource.findOne({
      where: {
        type: 'PULL_REQUEST',
        resource_id: meta.id,
        owner: meta.owner,
        project: meta.repo
      }
    })

    if (resource) {
      claim.pr_resource_id = resource.id
      return await claim.save()
    }

    const { data: pr } = await octokit.pulls.get({
      owner: meta.owner,
      repo: meta.repo,
      pull_number: meta.id
    })

    if (!pr) return

    const [prResource] = await db.GithubResource.upsert(
      {
        type: 'PULL_REQUEST',
        status: !!pr.merged_at ? 'MERGED' : !!pr.closed_at ? 'CLOSED' : 'OPEN',
        resource_id: pr.number,
        owner: meta.owner,
        project: meta.repo
      },
      { returning: true }
    )

    claim.pr_resource_id = prResource.id
    return await claim.save()
  } catch (err) {
    console.log(claim.toJSON(), meta, err)
  }
}

const updateClaim = async claim => {
  if (claim.issue_resource_id === null) await assignIssueResource(claim)
  if (claim.pr_resource_id === null) await assignPRResource(claim)
}

const seed = () =>
  db.Claim.findAll({
    where: {
      [db.Sequelize.Op.or]: [{ issue_resource_id: null }, { pr_resource_id: null }],
      status: 'claimed'
    }
  }).then(claims => claims.map(claim => updateClaim(claim)))

seed()
