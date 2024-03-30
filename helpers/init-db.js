const firebase = require('./firebase-rt-db');

const database = new firebase.FirebaseRtDB(
    process.env.FB_CREDENTIALS,
    process.env.FB_DB_URL
);

module.exports = { database }
