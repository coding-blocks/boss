/**
 * Created by championswimmer on 16/05/17.
 */
const GitHubApi = require("github");
const github = new GitHubApi({
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    headers: {
        "user-agent": "boss-backend" // GitHub is happy with a unique user agent
    },
    Promise: Promise,
    followRedirects: false,
    timeout: 5000
});
const db = require('./db');
const fs = require('fs');


function getClaims(options) {

    const offset = (options.page - 1 ) * options.size ;

    const whereClause = options.status ? { status:  options.status } : null ;
    return db.Claim.findAndCountAll({
        limit : options.size,
        offset : offset,
        where :  whereClause ,
        order: [['updatedAt', 'DESC']]
    });
}

function getClaimById(claimId) {
    return db.Claim.findById(claimId)
}

function delClaim(claimId) {
    return db.Claim.destroy({
        where: {
            id: claimId
        }
    })
}

function updateClaim(claimId, status) {

    const claim = {
        action: 'update',
        claimId, status
    };
    fs.writeFile(__dirname + '/../audit/' + new Date().toISOString() + '.json', JSON.stringify(claim), () => {});

    return db.Claim.update({
        status: status
    }, {
        where: {
            id: claimId
        }
    })
}

function createClaim(user, issueUrl, pullUrl, bounty, status) {


    return github.users.getForUser({
        username : user
    }).then(data=>{
       return db.Claim.create({
            user,
            issueUrl,
            pullUrl,
            repo: pullUrl.split('github.com/')[1].split('/')[1],
            bounty: bounty,
            status: status
        });
    });
}

function getLeaderboard(options) {

    console.log(options);
    options.size = parseInt(options.size);
    const offset = (options.page-1) * options.size;

    const userCount = db.Claim.aggregate('user' , 'count' , {distinct : true} )

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

exports = module.exports = {
    getClaims,
    delClaim,
    updateClaim,
    createClaim,
    getLeaderboard,
    getClaimById,
    updateClaim
};

