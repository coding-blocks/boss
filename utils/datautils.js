/**
 * Created by championswimmer on 16/05/17.
 */
const db = require('./db');
const fs = require('fs');


function getClaims(options) {

    const offset = (options.page - 1 ) * options.size;

    var whereClause = { status:  options.status};
    if(options.username){
        whereClause = { status:  options.status, user : options.username };
    }else if(options.projectname){
        whereClause = { status:  options.status, repo : options.projectname };
    }else if(options.bountyMin && options.bountyMax){
        whereClause = { status:  options.status, bounty: {
               $lt:options.bountyMax,
                $gt:options.bountyMin
        }};
    }

    const distinctUsers = db.Claim.aggregate('user', 'DISTINCT', { plain: false, where : { status:  options.status} })
    const distinctProjects = db.Claim.aggregate('repo', 'DISTINCT', { plain: false, where : { status:  options.status} })
    const allClaims = db.Claim.findAndCountAll({
        limit : options.size,
        offset : offset,
        where :  whereClause,
        order: [['updatedAt', 'DESC']]
    });

    return Promise.all([distinctUsers, allClaims, distinctProjects])
}

function getClaimById(claimId) {
    return db.Claim.findById(claimId)
}

function delClaim(claimId) {
    if (isNaN((+claimId))) {
        return res.send("ClaimId must be a number");
    }
    return db.Claim.destroy({
        where: {
            id: claimId
        }
    })
}

function updateClaim(claimId, {status, reason, bounty}) {

    const claim = {
        action: 'update',
        claimId, status, bounty
    };
    fs.writeFile(__dirname + '/../audit/' + new Date().toISOString() + '.json', JSON.stringify(claim), () => {
    });

    return db.Claim.update({
        status: status,
        reason: reason,
        bounty: bounty
    }, {
        where: {
            id: claimId
        },
      returning: true
    })
}

function createClaim(user, issueUrl, pullUrl, bounty, status) {

    const claim = {
        action: 'create',
        user, issueUrl, pullUrl, bounty, status
    };
    fs.writeFile(__dirname + '/../audit/' + new Date().toISOString() + '.json', JSON.stringify(claim), () => {
    });

    return db.Claim.create({
        user,
        issueUrl,
        pullUrl,
        repo: pullUrl.split('github.com/')[1].split('/')[1],
        bounty: bounty,
        status: status
    })
}

function getLeaderboard(options) {

    console.log(options);
    options.size = parseInt(options.size);
    const offset = (options.page - 1) * options.size;

    const userCount = db.Claim.aggregate('user', 'count', {distinct: true})

    const results = db.Database.query(`SELECT "user",
        SUM(CASE WHEN "claim"."status" = 'accepted' THEN "bounty" ELSE 0 END) as "bounty",
        COUNT("bounty") as "pulls"
        FROM "claims" AS "claim"
        GROUP BY "user"
        ORDER BY SUM(CASE WHEN "claim"."status" = 'accepted' THEN "bounty" ELSE 0 END) DESC, COUNT("bounty") DESC
        LIMIT ${options.size} OFFSET ${offset}`
    );

    return Promise.all([userCount, results]);
}

function getCounts() {
    const participants = db.Claim.aggregate('user', 'count', {distinct: true});
    const claims = db.Claim.aggregate('*', 'count');
    var accepted = db.Claim.aggregate(
        'bounty',
        'sum',
        {
            where: {
                "status": "accepted"
            }
        }
    );
    var totalclaimed = db.Claim.aggregate(
        'bounty',
        'sum'
    );
    if (Number.isNaN(accepted)) {
        accepted = 0;
    }
    if (Number.isNaN(totalclaimed)) {
        totalclaimed = 0;
    }
    return Promise.all([participants, claims, accepted, totalclaimed]);
}

exports = module.exports = {
    getClaims,
    delClaim,
    updateClaim,
    createClaim,
    getLeaderboard,
    getClaimById,
    updateClaim,
    getCounts
};
