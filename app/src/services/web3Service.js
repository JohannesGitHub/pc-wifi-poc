import store from '../store'
import 'babel-preset-react-native-web3/globals'
import Web3 from 'web3'

const ProviderEngine = require('web3-provider-engine')
const ZeroClientProvider = require('web3-provider-engine/zero.js')

const sigUtil = require('eth-sig-util')
const ethUtil = require('ethereumjs-util')
const EthTx = require('ethereumjs-tx')
const crypto = require('crypto')

const address = ethUtil.toChecksumAddress('')
const privateKey = Buffer('', 'hex')


export const WEB3_INITIALIZED = 'WEB3_INITIALIZED'
function web3Initialized(results) {
  return {
    type: WEB3_INITIALIZED,
    payload: results
  }
}

export const WEB3_ACCOUNT_UPDATED = 'WEB3_ACCOUNT_UPDATED'
function web3AccountUpdated(results) {
  return {
    type: WEB3_ACCOUNT_UPDATED,
    payload: results
  }
}

export const WEB3_ACCOUNT_BALANCE_UPDATED = 'WEB3_ACCOUNT_BALANCE_UPDATED'
function web3AccountBalanceUpdated(results) {
  return {
    type: WEB3_ACCOUNT_BALANCE_UPDATED,
    payload: results
  }
}

export const WEB3_NETWORK_UPDATED = 'WEB3_NETWORK_UPDATED'
function web3NetworkUpdated(results) {
  return {
    type: WEB3_NETWORK_UPDATED,
    payload: results
  }
}

export const WEB3_CONTRACT_INITIALIZED = 'WEB3_CONTRACT_INITIALIZED'
function web3ContractInitialized(results) {
  return {
    type: WEB3_CONTRACT_INITIALIZED,
    payload: results
  }
}

export const WEB3_SENT_TRANSACTION = 'WEB3_SENT_TRANSACTION'
function web3SentTransaction(results) {
  return {
    type: WEB3_SENT_TRANSACTION,
    payload: results
  }
}

export const WEB3_EVENT_FIRED = 'WEB3_EVENT_FIRED'
function web3EventFired(results) {
  return {
    type: WEB3_EVENT_FIRED,
    payload: results
  }
}

let state = {
  web3: null,
  engine: null,
  contract: null, 
  account: null
}

export const getBalance = () => new Promise((resolve, reject) => {
  state.web3.eth.getBalance(state.account, (err, res) => {
    if (err) { return reject(err) }
    let results = { etherBalance: Number(state.web3.fromWei(res.toNumber(), 'ether')).toFixed(2) }
    return resolve(store.dispatch(web3AccountBalanceUpdated(results)))
  })
})

const getAccount = () => new Promise((resolve, reject) => {
  state.web3.eth.getAccounts((err, res) => {
    if (err) { return reject(err) }
    let account = res[0]
    state.account = account
    state.web3.eth.defaultAccount = account
    return resolve(store.dispatch(web3AccountUpdated({ account: account })))
  })
})

export const getWeb3 = () => new Promise((resolve, reject) => {

  state.engine = ZeroClientProvider({
    rpcUrl: 'http://192.168.255.1:8545', // 'https://ropsten.infura.io',
    getAccounts: cb => { 
      cb(null, [address]) 
    },
    signTransaction: (txParams, cb) => { 
      if (txParams.gas !== undefined) txParams.gasLimit = txParams.gas
      txParams.value = txParams.value || '0x00'
      txParams.data = ethUtil.addHexPrefix(txParams.data)
      txParams.gasPrice = '0x174876e800'
      let tx = new EthTx(txParams)
      tx.sign(privateKey)
      cb(null, '0x'+tx.serialize().toString('hex')) 
    }, 
    signTypedMessage: (msgParams, cb) => {
      const serialized = sigUtil.signTypedData(privateKey, msgParams)
      cb(null, serialized)
    },
    signMessage: (msgParams, cb) => {
      let msgHash = ethUtil.sha3(msgParams.data)
      let sig = ethUtil.ecsign(msgHash, privateKey)
      let serialized = ethUtil.bufferToHex(sigUtil.concatSig(sig.v, sig.r, sig.s))
      cb(null, serialized)
    }
  })
  state.web3 = new Web3(state.engine)

  store.dispatch(web3Initialized({ web3Instance: state.web3 }))

  getAccount().then(() => { 
    return getBalance() 
  }).then(() => resolve()).catch(error => console.log(error))
})

export const transactionListener = (txHash) => new Promise((resolve, reject) => {
  let listener = setInterval(() => { 
    state.web3.eth.getTransactionReceipt(txHash, (error, result) => {
      if (error) { return reject(error) }
      if (result != null) { 
        clearInterval(listener)
        getBalance().catch(err => console.log(err))
        return resolve(result) }
    })
  }, 2000)
})