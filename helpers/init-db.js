const firebase = require('./firebase-rt-db');

const CREDENTIALS = process.env.FB_CREDENTIALS;
const DBURL = process.env.FB_DB_URL;

const database = new firebase.FirebaseRtDB(
    CREDENTIALS,
    DBURL
)

module.exports = { database }
