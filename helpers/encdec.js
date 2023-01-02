const crypto = require('crypto')

function createValKey(size) {
    if (size > 32) { size = 32 }
    let ValKey = crypto.randomUUID().replace(/[-]/g, '').substring(0, size)
    return ValKey
}

module.exports = { createValKey }
