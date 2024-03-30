const firebaseAdmin = require("firebase-admin");

class FirebaseRtDB {
    constructor(creds) {
        firebaseAdmin.initializeApp(eval(`new Object(${creds})`))
        this.database = firebaseAdmin.database()
    }

    get(path, onCompleteCallback = (data) => { }, onErrorCallback = (err) => { if (err) throw err }) {
        this.database.ref(path).once('value', (snapshot) => {
            onCompleteCallback(snapshot.val())
        }, (error) => {
            onErrorCallback(error)
        })
    }

    async getSync(path) {
        let data = null
        await new Promise((resolve, reject) => {
            this.database.ref(path).once('value', (snapshot) => {
                data = snapshot.val()
                if (typeof (data) != "object") {
                    data = JSON.parse(data)
                }
                resolve()
            }, (err) => {
                if (err) throw err
                reject()
            })
        })
        return data
    }

    set(path, value, onCompleteCallback = (err) => { if (err) throw err }) {
        this.database.ref(path).set(value, (err) => {
            onCompleteCallback(err)
        })
    }

    async setSync(path, value) {
        let status = 0
        await new Promise((resolve, reject) => {
            this.database.ref(path).set(value, (err) => {
                if (err) {
                    status = -1
                    reject(err)
                } else {
                    status = 1
                    resolve()
                }
            })
        })
        return status
    }

    update(path, value, onCompleteCallback = (err) => { if (err) throw err }) {
        this.database.ref(path).update(value, (err) => {
            onCompleteCallback(err)
        })
    }
}

module.exports = { FirebaseRtDB }
