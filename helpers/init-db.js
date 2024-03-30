const firebase = require('./firebase-rt-db');

const database = new firebase.FirebaseRtDB(
    "private/firebase-credentials.json",
    process.env.FB_DB_URL
);

module.exports = { database }
