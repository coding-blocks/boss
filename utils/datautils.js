/**
 * Created by championswimmer on 16/05/17.
 */
const db = require('./db');

function getClaims(status) {
    return db.Claim.findAll({
        status: status
    })
}

function delClaim(claimId) {
    return db.Claim.destroy({
        where: {
            id: claimId
        }
    })
}

function updateClaim(claimId, status) {
    return db.Claim.update({
        status: status
    }, {
        where: {
            id: claimId
        }
    })
}

function createClaim(user, issueUrl, pullUrl, bounty, status) {
    return db.Claim.create({
        user,
        issueUrl,
        pullUrl,
        repo: pullUrl.split('github.com/')[1].split('/')[1],
        bounty: bounty,
        status: status
    })
}

function getLeaderboard() {
    return db.Database.query('SELECT "user", ' +
        'SUM(CASE WHEN "claim"."status" = \'accepted\' THEN "bounty" ELSE 0 END) as "bounty", ' +
        'COUNT("bounty") as "pulls" FROM "claims" AS "claim" ' +
        'GROUP BY "user" ' +
        'ORDER BY SUM("bounty") DESC'
    )
}

exports = module.exports = {
    getClaims,
    delClaim,
    updateClaim,
    createClaim,
    getLeaderboard
};