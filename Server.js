// importing required modules
const fs = require('fs')
const http = require('http')
const express = require('express')
const app = express()
const api = require('./routes/api')
const inout = require('./routes/in-out')

app.use(express.static(__dirname + "/public"))
app.use(express.json())
app.use("/", api, inout)

app.get('/favicon.ico', (req, res) => {
    res.sendStatus(200);
})

const options = {
    key: fs.readFileSync('./private/http-options/server.key'),
    cert: fs.readFileSync('./private/http-options/server.cert')
}

http.createServer(options, app).listen(8081, () => {
    console.log('Server running at http://127.0.0.1:8081/')
})
