const express = require('express')
const router = express.Router()
const validations = require('../helpers/validations')
const database = require("../helpers/init-db").database

/*
 * /api-rc -> validates:
 *     - client and room
 * 
 * /api-cr-ct -> validates:
 *     - client and room
 *     - client type
 * 
 * /api-cr-ck -> validates:
 *     - client and room
 *     - client and key
 */

// some required middlewares

router.use('/api-cr', async (req, res, next) => {
    if (
        await validations.validateClientAndRoom(req.body['clientid'], req.body['roomid'])
    ) next()
    else {
        res.sendStatus(403)
    }
})

router.use('/api-cr-ct', async (req, res, next) => {
    if (
        await validations.validateClientAndRoom(req.body['clientid'], req.body['roomid'])
        && await validations.validateClientType(req.body['clientid'], req.body['roomid'], req.body['client_val_key'])
    ) next()
    else res.sendStatus(403)
})

router.use('/api-cr-ck', async (req, res, next) => {
    if (
        await validations.validateClientAndRoom(req.body['clientid'], req.body['roomid'])
        && await validations.validateClientAndKey(req.body['clientid'], req.body['roomid'], req.body['client_val_key'])
    ) {
        next()
    }
    else {
        res.sendStatus(403)
    }
})

// api requests
router.post('/api-cr', async (req, res) => {
    try {
        if (
            req.body["command"] === "read_chat"
        ) { // get text from chat area and pushing it into message file
            const CHAT_PATH = `/rooms/${req.body["roomid"]}/chat`;
            const MAX_MSG_NUM = 100;
            let Messages = [];
            let ChatData = await database.getSync(CHAT_PATH)
            
            if (ChatData != undefined) {
                let n = 0;
            	for (let i of Object.keys(ChatData)) {
                    if (i == 'base') continue;
    	            Messages.push([i, ChatData[i][0], ChatData[i][1], ChatData[i][2]]);
                    n++;
    	        }
	            res.send(Messages.slice(n - Math.min(MAX_MSG_NUM, n), n));
    	    } else {
    	    	res.send({'status': 'NO'})
    	    }
        } else if (
            req.body["command"] === "get_members"
        ) {
            database.get(`/rooms/${req.body["roomid"]}/info`, (data) => {
                const members = Object.keys(data['members'])
                let MembersData = {}
                for (const member of members) {
                    if (member == data['host']) {
                        MembersData[member] = "Host"
                    } else {
                        MembersData[member] = "Joiner"
                    }
                }
                res.json(MembersData)
            })
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(404)
    }
})

router.post('/api-cr-ct', async (req, res) => {
    try {
        if (
            req.body["command"] == "check_requests"
        ) {
            let RequestsData = await database.getSync(`/rooms/${req.body['roomid']}/requests`)
            let locRequest = null
            for (const request of Object.keys(RequestsData)) {
                if (RequestsData[request] == 0) {
                    locRequest = request
                    break
                }
            }

            if (locRequest != null) {
                res.json({ 'status': 'FOUND', 'request': locRequest })
            } else {
                res.json({ 'status': 'NOT_FOUND' })
            }
        } else if (
            req.body["command"] === "accept_request"
        ) {
            database.get(`/rooms/${req.body['roomid']}/requests`, (data) => {
                let RequestsData = JSON.parse(JSON.stringify(data))
                RequestsData[req.body['request']] = 1
                database.set(`/rooms/${req.body['roomid']}/requests`, RequestsData)
                res.sendStatus(200)
            })
        } else if (
            req.body["command"] === "refuse_request"
        ) {
            database.get(`/rooms/${req.body['roomid']}/requests`, (data) => {
                let RequestsData = JSON.parse(JSON.stringify(data))
                RequestsData[req.body['request']] = -1
                database.set(`/rooms/${req.body['roomid']}/requests`, RequestsData)
                res.sendStatus(200)
            })
        } else if (
            req.body['command'] === "delete_joiner"
        ) {
        	let RoomInfo = await database.getSync(`/rooms/${req.body["roomid"]}/info`)
        	
            delete RoomInfo['members'][req.body['joinerid']]
            await database.setSync(`/rooms/${req.body["roomid"]}/info`, RoomInfo)
            res.sendStatus(200)
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(404)
    }
})

router.post('/api-cr-ck', async (req, res) => {
    try {
    	const CHAT_PATH = `/rooms/${req.body["roomid"]}/chat`
        if (
            req.body["command"] === "write_message"
        ) {
        	let ChatData = await database.getSync(CHAT_PATH)

            let MsgIndex = Object.keys(ChatData).length
        	ChatData[MsgIndex.toString()] = [req.body['clientid'], req.body['message'], req.body['datetime']]
        	await database.setSync(CHAT_PATH, ChatData)
    	    res.sendStatus(200)
        } else if (
            req.body["command"] === "delete_message"
        ) {
            database.get(CHAT_PATH, (data) => {
                let ChatData = JSON.parse(JSON.stringify(data))
                delete ChatData[req.body['message_id']]
                database.set(CHAT_PATH, ChatData, (err) => {
                    if (err) throw err
                })
                res.sendStatus(200)
            })
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(404)
    }
})

module.exports = router
