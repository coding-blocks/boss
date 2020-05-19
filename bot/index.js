module.exports = app => {
  const adminUsernames = ['championswimmer','abhishek97','himankbhalla','jatinkatyal13','tathagat2006','hereisnaman','TdevM']

  app.log('Yay, the boss bot was loaded!')
  app.on('issues.opened', async context => {
    const issue = context.payload.issue
    if(adminUsernames.includes(issue.user.login)){
      app.log(`Ignoring new issue ${issue.id} created by admin ${issue.user.login}`)
      return
    }
    if (!issue.closed_at) {
      app.log(`Issue Opened: ${issue.id}`)

      const comment = context.issue({
        body: `Thanks @${issue.user.login}, for raising the issue!  🙌

One of our mentors will revert on this soon. ✅

Star ⭐ this project and [tweet](https://twitter.com/intent/tweet?text=I%20am%20contributing%20to%20open%20source%2C%20join%20me%20in%20participating%20in%20%23BOSS2020%20%40CodingBlocksIn%20https%3A%2F%2Fcb.lk%2Fboss%0A) 🐦 about BOSS 2020.`
      })

      return context.github.issues.createComment(comment)
    }
  })

  app.on('pull_request.opened', async context => {
    const pr = context.payload.pull_request
    if(adminUsernames.includes(issue.user.login)){
      app.log(`Ignoring new pr ${pr.id} opened by admin ${pr.user.login}`)
      return
    }
    if (!pr.closed_at) {
      app.log(`Pull Request Opened: ${pr.id}`)

      const comment = context.issue({
        body: `Thanks @${pr.user.login}, for opening the pull request!  🙌

One of our mentors will review the pull request soon. ✅

Star ⭐ this project and [tweet](https://twitter.com/intent/tweet?text=I%20am%20contributing%20to%20open%20source%2C%20join%20me%20in%20participating%20in%20%23BOSS2020%20%40CodingBlocksIn%20https%3A%2F%2Fcb.lk%2Fboss%0A) 🐦 about your contributions.`
      })

      return context.github.issues.createComment(comment)
    }
  })

  app.on('pull_request.closed', async context => {
    const pr = context.payload.pull_request
    if(adminUsernames.includes(pr.user.login)){
      app.log(`Ignoring pr ${issue.id} closing by admin ${pr.user.login}`)
      return
    }
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
