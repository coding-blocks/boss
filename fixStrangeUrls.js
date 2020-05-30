const config = require('./config')
const secrets = config.secrets
const Sequelize = require('sequelize')
const db = require('./utils/db')
const fs = require('fs')

function generateGenericUrl(url) {
  const extractSingleUrl = url.trim().split(' ')[0].split('#')[0]
  const genericUrl = new URL(extractSingleUrl).pathname.replace(/\/+$/, '')
  return `https://github.com${genericUrl}`
}

async function worker() {
  // these two claims are done twice, with a space, so no other option than to delete it
  const firstConflict = await db.Database.query(
    `DELETE FROM "claims" WHERE "pullUrl" = ' https://github.com/coding-blocks/gondor/pull/61'`
  )

  const secondConflict = await db.Database.query(
    `DELETE FROM "claims" WHERE "pullUrl" = 'https://github.com/coding-blocks/boss/pull/308#issuecomment-633161908'`
  )

  const thirdConflict = await db.Database.query(
    `UPDATE "claims" SET "issueUrl"='https://github.com/coding-blocks/gondor/pull/22' WHERE "pullUrl" = 'https://github.com/coding-blocks/gondor/pull/22'`
  )

  const fourthConflict = await db.Database.query(
    `UPDATE "claims" SET "issueUrl"='https://github.com/coding-blocks/make-a-pr/pull/717' WHERE "pullUrl" = 'https://github.com/coding-blocks/make-a-pr/pull/717'`
  )

  // `DELETE FROM "claims" WHERE "pullUrl" = 'https://github.com/coding-blocks/boss/pull/308#issuecomment-633161908'`
  const response = await db.Database.query(
    `SELECT "issueUrl", "pullUrl", "id" FROM "claims" `
  )

  const rows = response[0]
  console.log(rows)
  for (let i = 0; i < rows.length; i += 1) {
    try {
      let pullUrl = rows[i].pullUrl
      let issueUrl = rows[i].issueUrl
      pullUrl = generateGenericUrl(pullUrl)
      issueUrl = generateGenericUrl(issueUrl)
      console.log(`Processing id #${rows[i].id} ...`)
      const dbResponse = await db.Claim.update(
        {
          issueUrl: issueUrl,
          pullUrl: pullUrl
        },
        {
          where: {
            id: rows[i].id
          },
          returning: true
        }
      )
    } catch (error) {
      fs.appendFileSync('errors.txt', `${error.message} in ${rows[i].id}\n`)
      console.log(`>>>>>>>${error.message}`)
      console.log(error)
    }
  }
}

worker()
