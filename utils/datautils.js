/**
 * Created by championswimmer on 16/05/17.
 */
const db = require('./db');
const RSVP = require('rsvp');

function getClaims(options) {

    const offset = (options.page - 1 ) * options.size ;
    const lastPage = db.Claim.count().then(cnt=>{
        return Math.ceil( cnt / options.size );
    });
     const claims = db.Claim.findAll({
        limit : options.size,
        offset : offset,
        status: options.status,
        order: [['updatedAt', 'DESC']]
     });

    return RSVP.hash({
        lastPage : lastPage,
        claims : claims
    });

}

function getClaimById(claimId) {
    return db.Claim.findById(claimId)
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
    getLeaderboard,
    getClaimById,
    updateClaim
};