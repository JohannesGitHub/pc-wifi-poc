const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const fs = require('fs')
const { exec } = require('child_process')

const sqlite3 = require('sqlite3').verbose()
const ethUtil = require('ethereumjs-util')

const db = new sqlite3.Database('../microraiden-server/channel.db')

const configPath = '/var/www/wlanguests'
const threshold = 1

let establishedConnections = {}

app.get('/', (req, res) => {
  res.state(200).end()
})

server.listen(9000, () => {
  console.log('Access Control Server listening on port 9000!')

  // let senderAddress = ethUtil.toChecksumAddress('0x035b9a9c145598b125073736ae6f0716ec15675a')

  setInterval(() => { 
    Promise.all([getAccesses(), getOpenChannels()]).then(values => {
      let accesses = values[0]
      let channels = values[1]

      Object.keys(accesses).forEach(sender => {
        getOpenChannel(sender).then(res => {
          if (res.length === 0) {
            forgetAccess(accesses[sender]['macAddress']).then(() => {
              console.log('INFO revoke access from ' + sender + '    reason=no open channel found')
              io.emit('revokedAccess', { recipient: sender, msg: 'no open channel found'})
            })
          }
        })
      })

      channels.forEach(channel => {
        let sender = channel['sender']
        
        if (accesses[sender]) {
          return getDataUsage(accesses[sender]['macAddress']).then(usage => {
            console.log('INFO sender=' + sender + '    open_block_number=' + channel['open_block_number'] + '    usage=' + String(Number(usage / threshold)).substring(0, 7) + '    payment_nonce=' + channel['payment_nonce'] + '    request_nonce=' + channel['request_nonce'])
            if (Number((usage / threshold).toString().split('.')[0]) - channel['payment_nonce'] < 1) { return }
            if (channel['payment_nonce'] === channel['request_nonce']) {
              return incrementRequestNonceOfChannel(channel['request_nonce'], channel['sender'], channel['open_block_number']).then(() => {
                console.log('INFO request payment from ' + sender)                  
                io.emit('requestPayment', { recipient: sender })                  
              })
            } 
            return revokeAccess(accesses[sender]['macAddress']).then(() => {
              console.log('INFO revoke access from ' + sender + '    reason=payment pending')
              return io.emit('revokedAccess', { recipient: sender, msg: 'payment pending'})
            })
          }).catch(error => console.error(error))
        } 
        if (establishedConnections[sender] && channel['payment_nonce'] === channel['request_nonce']) {
          return grantAccess(establishedConnections[sender]['macAddress'], establishedConnections[sender]['ipAddress'], sender).then(() => {
            console.log('INFO grant access to ' + sender)
          }).catch(error => console.error(error))
        }
      })
    }).catch(error => { console.error(error) })
  }, 10000)
})

io.on('connection', socket => {

  console.log('INFO new connection')

  socket.on('openSession', msg => { 

    let ipAddress = socket.handshake.address.split(':')[3] // socket.request.connection.remoteAddress
    let ethereumAddress = msg.ethereumAddress

    getMacFromIp(ipAddress).then(macAddress => {
      establishedConnections[ethereumAddress] = { ipAddress: ipAddress, macAddress: macAddress }
    }).catch(error => console.error(error))
  })

  socket.on('disconnect', () => {

    let ipAddress = socket.handshake.address.split(':')[3]

    getMacFromIp(ipAddress).then(macAddress => {
      Object.keys(establishedConnections).forEach(connection => {
        if (establishedConnections[connection]['macAddress'] === macAddress) {
          delete establishedConnections[connection]
        }
      })
    }).catch(error => console.error(error))
  })
})

/**
 * get ip address from mac address from arp table
 * @param {string} macAddress 
 * @returns {Promise} Promise to ip address
 */
function getIpFromMac(macAddress) {
  return new Promise((resolve, reject) => {
    exec('arp -n | grep -w -i ' + macAddress + ' | awk  \'BEGIN { ORS=\" \" }; {print $1}\'', (error, stdout, stderr) => {
      if (error) { return reject(error) }
      resolve(stdout)
    })
  })
}

/**
 * get mac address from ip address from arp table
 * @param {string} ip 
 * @returns {Promise} Promise to mac address
 */
function getMacFromIp(ip) {
  return new Promise((resolve, reject) => {
    exec('arp -n | grep -w -i ' + ip + ' | grep -o -E \'([[:xdigit:]]{1,2}:){5}[[:xdigit:]]{1,2}\' | tr -d \'\n\'', (error, stdout, stderr) => {
      if (error) { return reject(error) }
      resolve(stdout)    
    })
  })
}

/**
 * get data usage by mac address from iptables
 * @param {string} macAddress 
 * @returns {Promise} Promise to usage in megabytes
 */
function getDataUsage(macAddress) {
  return new Promise((resolve, reject) => {
    // get traffic from mac address
    exec('sudo iptables -L PREROUTING -t mangle -n -x -v | grep -i ' + macAddress + ' | awk  \'BEGIN { ORS=\" \" }; {print $2}\'', (error, stdout, stderr) => {
      if (error) { return reject(error) }
      return resolve(Number(stdout) * 0.000001)
    })
    // get traffic to mac address
  })
}

/**
 * grant internet access 
 * @param {string} macAddress 
 * @param {string} ipAddress 
 * @param {string} ethereumAddress 
 * @returns {Promise} Promise
 */
function grantAccess(macAddress, ipAddress, ethereumAddress) {
  let fileName = macAddress.split(':').join('')
  let data = { ipAddress: ipAddress, ethereumAddress: ethereumAddress }
  return new Promise((resolve, reject) => {
    fs.writeFile(configPath + '/' + fileName, JSON.stringify(data), 'utf8', error => {
      if(error) { return reject(error) }
      resolve()
    })
  }) 
}

/**
 * revoke internet access 
 * normalize nonces for channel in db and delete file in /var/www/wlanguests
 * @param {string} macAddress 
 * @returns {Promise} Promise 
 */
function revokeAccess(macAddress) {
  let fileName = macAddress.split(':').join('')
  return new Promise((resolve, reject) => {
    getAccess(macAddress).then(result => {
      return result['ethereumAddress']
    }).then(sender => {
      return getOpenChannel(sender)
    }).then(channels => {
      let channel = channels[0]
      return normalizeNoncesOfChannel(channel['sender'], channel['open_block_number'], channel['payment_nonce'], channel['request_nonce'])
    }).then(res => {
      fs.unlink(configPath + '/' + fileName, error => {
        if(error) { throw(error) }
        resolve()
      })
    }).catch(error => reject(error))
  })
}

/**
 * revoke internet access
 * delete file in /var/www/wlanguests
 * @param {string} macAddress 
 * @returns {Promise} Promise
 */
function forgetAccess(macAddress) {
let fileName = macAddress.split(':').join('')
  return new Promise((resolve, reject) => {
    fs.unlink(configPath + '/' + fileName, error => {
      if(error) { reject(error) }
      resolve()
    })
  })
}

/**
 * get all access in /var/www/wlanguests
 * @returns {Promise} Promise to accesses
 */
function getAccesses() {
  return new Promise((resolve, reject) => {
    fs.readdir(configPath, (error, files) => {
      if (error) { return reject(error) }
      let accesses = {}
      let promises = files.map(file => {
        return new Promise((resolve, reject) => {
          let macAddress = file.match(/.{2}/g).join(':')
          fs.readFile(configPath + '/' + file, (error, result) => {
            if (error) { return reject(error) }
            try {
              let json = JSON.parse(result.toString('utf8'))
              if (json == null) { return resolve() }
              resolve(accesses[json['ethereumAddress']] = { macAddress: macAddress, ipAddress: json['ipAddress'] }) 
            }
            catch (exception) { return resolve() } 
          })
        })
      })
      Promise.all(promises).then(() => {
        resolve(accesses)
      }).catch(error => { reject(error) })
    })
  })
}

/**
 * get access by mac address
 * @param {string} macAddress 
 * @returns {Promise} Promise to access
 */
function getAccess(macAddress) {
  let fileName = macAddress.split(':').join('')
  return new Promise((resolve, reject) => {
    fs.readFile(configPath + '/' + fileName, (error, result) => {
      if (error) { return reject(error) }
      try {
        let json = JSON.parse(result.toString('utf8'))
        if (json == null) { return reject() }
        resolve(json) 
      }
      catch (exception) { return reject() }  
    })
  })
}

/**
 * get all open channels from db
 * @returns {Promise} Promise to channels
 */
function getOpenChannels() {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT sender, open_block_number, payment_nonce, request_nonce FROM channels WHERE state = ? GROUP BY sender ORDER BY open_block_number;'
    db.all(sql, { 1: 0 }, (error, result) => {
      if (error) { return reject(error) }
      resolve(result)
    })
  })
}

/**
 * get open channel from db
 * @param {string} sender 
 * @returns {Promise} Promise to channel
 */
function getOpenChannel(sender) {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT sender, open_block_number, payment_nonce, request_nonce FROM channels WHERE sender = ? and state = ? GROUP BY sender ORDER BY open_block_number;'
    db.all(sql, { 1: sender, 2: 0 }, (error, result) => {
      if (error) { return reject(error) }
      resolve(result)
    })
  })
}

/**
 * increment request nonce of channel by one
 * @param {number} requestNonce 
 * @param {string} sender 
 * @param {number} openBlockNumber 
 * @returns {Promise} Promise to result
 */
function incrementRequestNonceOfChannel(requestNonce, sender, openBlockNumber) {
  return new Promise((resolve, reject) => {
    let sql = 'UPDATE channels SET request_nonce = ? WHERE sender = ? and open_block_number = ?;'
    db.run(sql, { 1: requestNonce + 1, 2: sender, 3: openBlockNumber }, (error, result) => {
      if (error) { return reject(error) }
      resolve(result)
    })
  })
}

/**
 * normalize payment and request nonce. 
 * set request nonce equal to request nonce payment nonce and payment nonce to zero
 * @param {string} sender 
 * @param {number} openBlockNumber 
 * @param {number} paymentNonce 
 * @param {number} requestNonce 
 * @returns {Promise} Promise to result
 */
function normalizeNoncesOfChannel(sender, openBlockNumber, paymentNonce, requestNonce) {
  console.log(sender, openBlockNumber, paymentNonce, requestNonce)
  return new Promise((resolve, reject) => {
    let sql = 'UPDATE channels SET payment_nonce = ?, request_nonce = ? WHERE sender = ? and open_block_number = ?;'
    let normalizedRequestNonce = requestNonce > paymentNonce? requestNonce - paymentNonce - 1 : 0
    db.run(sql, { 1: -1, 2: normalizedRequestNonce, 3: sender, 4: openBlockNumber }, (error, result) => {
      if (error) { return reject(error) }
      resolve(result)
    })
  })
}
