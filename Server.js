// importing required modules
const fs = require('fs')
const express = require('express')
const app = express()

fs.writeFileSync("./private/firebase-credentials.json", process.env.FB_CREDENTIALS)

const api = require('./routes/api')
const serverIO = require('./routes/server-io')

app.use(express.static(__dirname + "/public"))
app.use(express.json())
app.use("/", api, serverIO)

const PORT = 8081
app.listen(PORT, () => {
    console.log(`Server running at \`http://127.0.0.1:${PORT}\``)
})
