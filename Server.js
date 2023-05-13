// importing required modules
const express = require('express')
const app = express()
const api = require('./routes/api')
const serverIO = require('./routes/server-io')

app.use(express.static(__dirname + "/public"))
app.use(express.json())
app.use("/", api, serverIO)

const PORT = 8081
app.listen(PORT, () => {
    console.log(`Server running at \`http://127.0.0.1:${PORT}\``)
})
