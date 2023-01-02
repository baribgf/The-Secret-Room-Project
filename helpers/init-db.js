const firebase = require('./firebase-rt-db');

const database = new firebase.FirebaseRtDB(
    "../private/secretroom-76218-firebase-adminsdk-credentials.json",
    "https://secretroom-76218-default-rtdb.europe-west1.firebasedatabase.app/"
)

module.exports = { database }
