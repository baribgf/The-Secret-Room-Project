const express = require('express')
const router = express.Router()
const encdec = require('../helpers/encdec');
const validations = require('../helpers/validations');
const database = require("../helpers/init-db").database

router.post('/host', (req, res) => {
    try {
        database.get('/rooms', (files) => {
            for (let i of Object.keys(files)) {
                if (i == req.body['RoomID']) {
                    return res.json({ 'status': 'NOT_ALLOWED' })
                }
            }

            let RoomValKey = encdec.createValKey(32)
            let ClientValKey = encdec.createValKey(8)
            let ClientID = req.body['HostID']
            database.update('/rooms', JSON.parse(`{"${req.body['RoomID']}": "{}"}`))
            database.update(`/rooms/${req.body['RoomID']}`, JSON.parse(`{ "base": "{}" }`))
            database.update(`/rooms/${req.body['RoomID']}`, JSON.parse(`{ "chat": "{}" }`))
            database.update(`/rooms/${req.body['RoomID']}/chat`, JSON.parse(`{ "base": "" }`))
            let RoomInfoData = { 'room_val_key': RoomValKey, 'host': ClientID, members: {} }
            RoomInfoData['members'][ClientID] = ClientValKey
            database.update(`/rooms/${req.body['RoomID']}`, JSON.parse(`{ "info": ${JSON.stringify(RoomInfoData)} }`))
            database.update(`/rooms/${req.body['RoomID']}`, JSON.parse(`{ "requests": "{}" }`))
            return res.json({ 'status': 'ALLOWED', 'room_val_key': RoomValKey, 'client_val_key': ClientValKey, 'client_type': 'host' })
        }, (err) => {
            if (err) throw err
        })
    } catch (error) {
        console.error(error);
        res.sendStatus(404)
    }
})

router.post('/request-to-join', async (req, res) => {
    try {
        const rooms = Object.keys(await database.getSync('/rooms'))
        for (let room of rooms) {
            if (room == req.body['RoomID']) {
                let memberExists = false
                let RoomInfo = await database.getSync(`/rooms/${req.body['RoomID']}/info`)
                
                if (typeof(RoomInfo) != 'object') {
                	RoomInfo = JSON.parse(RoomInfo)
                }
                
                let members = Object.keys(RoomInfo['members'])
                for (const member of members) {
                    if (member == req.body['JoinerID']) {
                        memberExists = true
                        return res.json({ 'status': 'INVALID_JOINER_ID' })
                    }
                }

                let RequestsData = await database.getSync(`/rooms/${req.body['RoomID']}/requests`)
                if (typeof(RequestsData) != 'object') {
                	RequestsData = JSON.parse(RequestsData)
                }
                
                RequestsData[req.body['JoinerID']] = 0
                await database.setSync(`/rooms/${req.body['RoomID']}/requests`, RequestsData)
                return res.json({ 'status': 'FOUND' });
            }
        }
        return res.json({ 'status': 'NOT_FOUND' });
    } catch (error) {
        console.error(error);
        res.sendStatus(404)
    }
})

router.post('/check-acceptance', async (req, res) => {
    try {
        let RequestsData = JSON.parse(JSON.stringify(await database.getSync(`/rooms/${req.body['RoomID']}/requests`)))
        if (RequestsData[req.body['JoinerID']] == 1) {
            let RoomInfoData = JSON.parse(JSON.stringify(await database.getSync(`/rooms/${req.body['RoomID']}/info`)))
            let ClientValKey = encdec.createValKey(8)
            let NewMembers = RoomInfoData['members']
            NewMembers[req.body['JoinerID']] = ClientValKey
            RoomInfoData['members'] = NewMembers
            await database.setSync(`/rooms/${req.body['RoomID']}/info`, RoomInfoData)
            return res.json({ 'status': 'ALLOWED', 'room_val_key': RoomInfoData['room_val_key'], 'client_val_key': ClientValKey, 'client_type': 'joiner' })
        } else if (RequestsData[req.body['JoinerID']] == -1) {
            return res.json({ 'status': 'NOT_ALLOWED' })
        }
        return res.json({ 'status': 'NO_DECISION' })
    } catch (error) {
        console.error(error);
        res.sendStatus(404)
    }
})

let exitTimeouts = {}
router.post('/host-exit', (req, res) => {
    const ExitDelay = 10000
    try {
        if (
            req.body['command'] == 'clear_room'
            && validations.validateClientAndRoom(req.body['clientid'], req.body['roomid'])
            && validations.validateClientType(req.body['clientid'], req.body['roomid'], req.body['client_val_key'])
        ) {
            exitTimeouts[req.body['roomid']] = setTimeout(() => {
                database.set(`/rooms/${req.body['roomid']}`, {}, (err) => {
                    if (err) throw err
                    res.sendStatus(200)
                })
            }, ExitDelay)
        } else if (
            req.body['command'] == 'cancel_clear_room'
            && validations.validateClientAndRoom(req.body['clientid'], req.body['roomid'])
            && validations.validateClientType(req.body['clientid'], req.body['roomid'], req.body['client_val_key'])
        ) {
            clearTimeout(exitTimeouts[req.body['roomid']])
            res.sendStatus(200)
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(404)
    }
})

module.exports = router
