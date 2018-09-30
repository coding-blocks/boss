let secrets = require('./secrets-sample.json')

if (process.env.NODE_ENV === 'production') {
  secrets = require('./secrets.json')
  if (!secrets) {
    throw new Error(`Cannot run unless you create secrets.json in the root.
    (Copy from secrets-sample.json and modify)`)
  }
}

module.exports = {
  secrets,
  "CLAIM_STATUS": {
    "CLAIMED": "claimed",
    "ACCEPTED": "accepted",
    "REJECTED": "rejected",
    "DISPUTED": "disputed",
    "REVOKED": "revoked"
  },
  "PAGINATION_SIZE": 10,
  "TEST_MODE": false
}