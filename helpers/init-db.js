const firebase = require('./firebase-rt-db');

const CREDENTIALS = process.env.FB_CREDENTIALS;

const database = new firebase.FirebaseRtDB(CREDENTIALS)

module.exports = { database }
