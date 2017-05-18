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
        status: options.status
    });

    return RSVP.hash({
        lastPage : lastPage,
        claims : claims
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

function getLeaderboard(options) {

    console.log(options);
    options.size = parseInt(options.size);
    const offset = (options.page-1) * options.size;

    const lastPage = db.Claim.aggregate('user' , 'count' , {distinct : true} ).then( cnt=>{
        return Math.ceil(cnt / options.size);
    });

    const results = new RSVP.Promise( function (resolve,reject) {
        db.Database.query(`SELECT "user", 
        SUM(CASE WHEN "claim"."status" = 'accepted' THEN "bounty" ELSE 0 END) as "bounty", 
        COUNT("bounty") as "pulls" FROM "claims" AS "claim" 
        GROUP BY "user" 
        ORDER BY SUM("bounty") DESC LIMIT ${options.size} OFFSET ${offset}`
        ).spread((results, meta) => {
            resolve(results);
        });
    });

    return RSVP.hash({
      results , lastPage
    });
    
   
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
