const firebase = require('./firebase-rt-db');

const CREDENTIALS = process.env.FB_CREDENTIALS;
const DBURL = process.env.FB_DB_URL;

/*
const database = new firebase.FirebaseRtDB(
    "../private/secretroom-firebase-api-credentials.json",
    "https://secretroom-76218-default-rtdb.europe-west1.firebasedatabase.app/"
)
*/

const database = new firebase.FirebaseRtDB(
    CREDENTIALS,
    DBURL
)

module.exports = { database }
