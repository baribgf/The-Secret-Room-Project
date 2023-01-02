const database = require("../helpers/init-db").database

// helper functions for validations
async function validateClientAndRoom(ClientID, RoomID) {
    let perm = false
    await new Promise(async (resolve, reject) => {
        try {
            let RoomInfo = await database.getSync(`/rooms/${RoomID}/info`)
            if (Object.keys(RoomInfo['members']).includes(ClientID)) {
                perm = true
                resolve()
            }
            resolve()
        } catch (err) {
            console.error(err);
            reject()
        }
    })
    return perm
}

async function validateClientAndKey(ClientID, RoomID, ClientValKey) { // checks the identity of client
    let perm = false
    await new Promise(async (resolve, reject) => {
        try {
            let RoomInfo = await database.getSync(`/rooms/${RoomID}/info`)
            if (RoomInfo['members'][ClientID] == ClientValKey) {
                perm = true
            }
            resolve()
        } catch (error) {
            console.error(err);
            reject()
        }
    })
    return perm
}

async function validateClientType(ClientID, RoomID, ClientValKey) { // checks whether the user is host in specified room
    let perm = false
    await new Promise(async (resolve, reject) => {
        try {
            let data = await database.getSync(`/rooms/${RoomID}/info`)
            if (
                data['members'][ClientID] == ClientValKey
                && data['host'] == ClientID
            ) {
                perm = true
            }
            resolve()
        } catch (error) {
            console.error(err);
            reject()
        }
    })
    return perm
}

module.exports = {validateClientAndRoom, validateClientAndKey, validateClientType}
