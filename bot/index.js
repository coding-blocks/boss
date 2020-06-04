const db = require('../utils/db')
const { getResourceFromUrl } = require('../utils/datautils')

module.exports = app => {
  const adminUsernames = [
    'championswimmer',
    'abhishek97',
    'himankbhalla',
    'jatinkatyal13',
    'tathagat2006',
    'hereisnaman',
    'TdevM'
  ]

  app.log('Yay, the boss bot was loaded!')

  const onIssueOpen = async issue => {
    const meta = getResourceFromUrl(issue.html_url)
    const [resource] = await db.GithubResource.upsert(
      {
        type: 'ISSUE',
        status: 'OPEN',
        resource_id: issue.number,
        owner: meta.owner,
        project: meta.repo
      },
      { returning: true }
    )

    return db.Claim.update(
      { issue_resource_id: resource.id },
      {
        where: {
          issueUrl: {
            [db.Sequelize.Op.like]: `%${meta.owner}/${meta.repo}/issues/${meta.id}%`
          }
        }
      }
    )
  }

  app.on('issues.reopened', context => {
    const issue = context.payload.issue

    app.log(`Issue ReOpened: ${issue.number}`)

    return onIssueOpen(issue)
  })

  app.on('issues.opened', async context => {
    const issue = context.payload.issue

    if (issue.closed_at) return
    app.log(`Issue Opened: ${issue.number}`)

    await onIssueOpen(issue)

    if (adminUsernames.includes(issue.user.login))
      return app.log(`Ignoring new issue ${issue.id} created by admin ${issue.user.login}`)

    const comment = context.issue({
      body: `Thanks @${issue.user.login}, for raising the issue!  🙌

One of our mentors will revert on this soon. ✅

Star ⭐ this project and [tweet](https://twitter.com/intent/tweet?text=I%20am%20contributing%20to%20open%20source%2C%20join%20me%20in%20participating%20in%20%23BOSS2020%20%40CodingBlocksIn%20https%3A%2F%2Fcb.lk%2Fboss%0A) 🐦 about BOSS 2020.`
    })

    return context.github.issues.createComment(comment)
  })

  app.on('issues.closed', async context => {
    const issue = context.payload.issue

    if (!issue.closed_at) return
    app.log(`Issue Closed: ${issue.number}`)

    const meta = getResourceFromUrl(issue.html_url)
    await db.GithubResource.upsert({
      type: 'ISSUE',
      status: 'CLOSED',
      resource_id: issue.number,
      owner: meta.owner,
      project: meta.repo
    })
  })

  const onPrOpen = async pr => {
    const meta = getResourceFromUrl(pr.html_url)
    const [resource] = await db.GithubResource.upsert(
      {
        type: 'PULL_REQUEST',
        status: 'OPEN',
        resource_id: pr.number,
        owner: meta.owner,
        project: meta.repo
      },
      { returning: true }
    )

    return db.Claim.update(
      { pr_resource_id: resource.id },
      {
        where: {
          pullUrl: {
            [db.Sequelize.Op.like]: `%${meta.owner}/${meta.repo}/pull/${meta.id}%`
          }
        }
      }
    )
  }

  app.on('pull_request.reopened', context => {
    const pr = context.payload.pull_request

    app.log(`Pull Request Opened: ${pr.id}`)

    return onPrOpen(pr)
  })

  app.on('pull_request.opened', async context => {
    const pr = context.payload.pull_request
    if (pr.closed_at) return

    app.log(`Pull Request Opened: ${pr.id}`)

    await onPrOpen(pr)

    if (adminUsernames.includes(pr.user.login)) {
      app.log(`Ignoring new pr ${pr.id} opened by admin ${pr.user.login}`)
      return
    }

    const comment = context.issue({
      body: `Thanks @${pr.user.login}, for opening the pull request!  🙌

One of our mentors will review the pull request soon. ✅

Star ⭐ this project and [tweet](https://twitter.com/intent/tweet?text=I%20am%20contributing%20to%20open%20source%2C%20join%20me%20in%20participating%20in%20%23BOSS2020%20%40CodingBlocksIn%20https%3A%2F%2Fcb.lk%2Fboss%0A) 🐦 about your contributions.`
    })

    return context.github.issues.createComment(comment)
  })

  app.on('pull_request.closed', async context => {
    const pr = context.payload.pull_request
    if (!pr.closed_at && !pr.merged_at) return

    const meta = getResourceFromUrl(pr.html_url)
    await db.GithubResource.upsert({
      type: 'PULL_REQUEST',
      status: !!pr.merged_at ? 'MERGED' : 'CLOSED',
      resource_id: pr.number,
      owner: meta.owner,
      project: meta.repo
    })

    if (!!pr.merged_at) {
      app.log(`Pull Request Closed: ${pr.id}`)

      const comment = context.issue({
        body: `Congratualtions @${pr.user.login}, your pull request is merged! 🎉 

Thanks for your contributions and participating in BOSS 2020. 🙌

You can claim your bounty points [here](https://boss.codingblocks.com/claims/add). 💰`
      })

      return context.github.issues.createComment(comment)
    }
  })
}
