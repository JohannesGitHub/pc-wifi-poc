import 'cross-fetch/polyfill'

import store from '../store'
import { MicroRaiden } from '../modules/microraiden'
import { getBalance } from './web3Service' 

import contractABI from '../assets/contracts/abi/RaidenMicroTransferChannels'
import tokenABI from '../assets/contracts/abi/Token.json'

// ropsten testnet contract addresses
const contractAddress = '0x74434527b8e6c8296506d61d0faf3d18c9e4649a'  
const tokenAddress = '0xff24d15afb9eb080c089053be99881dd18aa1090'

let receiver = ''

const pricePerUnit = 2

const DOMAIN = 'http://192.168.255.1'
const PORT = ':5000'

export const URAIDEN_INITIALIZED = 'URAIDEN_INITIALIZED'
function uraidenInitialized(results) {
  return {
    type: URAIDEN_INITIALIZED,
    payload: results
  }
}

export const URAIDEN_ACCOUNT_BALANCE_UPDATED = 'URAIDEN_ACCOUNT_BALANCE_UPDATED'
function uraidenAccountBalanceUpdated(results) {
  return {
    type: URAIDEN_ACCOUNT_BALANCE_UPDATED,
    payload: results
  }
}

export const URAIDEN_CHANNEL_UPDATED = 'URAIDEN_CHANNEL_UPDATED'
function uraidenChannelUpdated(results) {
  return {
    type: URAIDEN_CHANNEL_UPDATED,
    payload: results
  }
}

export const URAIDEN_STATUS_UPDATED = 'URAIDEN_STATUS_UPDATED'
function uraidenStatusUpdated(results) {
  return {
    type: URAIDEN_STATUS_UPDATED,
    payload: results
  }
}


let state = {
  uraiden: null,
}

export const getAccountFromWeb3 = () => store.getState().web3.account

const getAccountBalance = () => new Promise((resolve, reject) => {

  let account = getAccountFromWeb3()

  state.uraiden.getTokenInfo(account).then(token => {
    let tknBalance = state.uraiden.tkn2num(token.balance) 
    let results = { tknBalance: tknBalance }
    resolve(store.dispatch(uraidenAccountBalanceUpdated(results)))
  }).catch(error => reject(error))

  getBalance().catch(err => console.log(err))
})

export const openChannel = depositAmount => dispatch => new Promise((resolve, reject) => {

  if (!depositAmount) { depositAmount = 0 }

  store.dispatch(uraidenStatusUpdated({status: 'opening channel ...'}))

  let account = getAccountFromWeb3()

  state.uraiden.openChannel(account, receiver, state.uraiden.num2tkn(depositAmount)).then(channel => {
    return state.uraiden.getChannelInfo(channel) 
  }).then(info => {
    let channelInfo = {
      block: info.block,
      deposit: state.uraiden.tkn2num(info.deposit), 
      withdrawn: state.uraiden.tkn2num(info.withdrawn),
      state: info.state
    }
    console.log('MicroRaiden: channel opened | receiver: ' + receiver + ', state: ' + channelInfo.state + ', deposited: ' + channelInfo.deposit + ', block: ' + channelInfo.block)
    resolve(store.dispatch(uraidenChannelUpdated({ channel: channelInfo })))
    store.dispatch(uraidenStatusUpdated({status: ''}))
    return getAccountBalance()
  }).catch(error => { console.log(error); reject() }) 
})

const loadChannel = () => new Promise((resolve, reject) => { 

  let account = getAccountFromWeb3()

  state.uraiden.loadStoredChannel(account, receiver).then(channel => {

    // state.uraiden.forgetStoredChannel().catch(err => console.log(err))

    if (state.uraiden.isChannelValid() && channel.closing_sig == null) {
      // verify proof (uraiden.web3.toBigNumber(RDN-Sender-Balance), RDN-Balance-Signature)
      return channel
    } 

    return state.uraiden.loadChannelFromBlockchain(account, receiver)
  }).then(channel => {
    return state.uraiden.getChannelInfo(channel) 
  }).then(info => {
    let channelInfo = {
      block: info.block,
      deposit: state.uraiden.tkn2num(info.deposit),
      withdrawn: state.uraiden.tkn2num(info.withdrawn),
      state: info.state
    }
    console.log('MicroRaiden: channel loaded | receiver: ' + receiver + ', state: ' + channelInfo.state + ', deposited: ' + channelInfo.deposit + ', block: ' + channelInfo.block)
    resolve(store.dispatch(uraidenChannelUpdated({ channel: channelInfo })))
  }).catch(err => { store.dispatch(uraidenChannelUpdated({ channel: { state: null }})); reject(err) })
})

export const closeChannel = () => () => new Promise((resolve, reject) => {
  
  let sender = state.uraiden.channel.account
  let openingBlock = state.uraiden.channel.block
  let balance = state.uraiden.channel.proof.balance.toNumber()

  store.dispatch(uraidenStatusUpdated({status: 'closing channel ...'}))

  fetch(DOMAIN + PORT + '/api/1/channels/' + sender + '/' + openingBlock, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({balance: balance}),
  }).then(response => { 
    if (response.status === 200) { return response.json() }
    throw(response)
  }).then(json => {
    return state.uraiden.closeChannel(json.close_signature)
  }).then(() => {
    return state.uraiden.getChannelInfo(state.uraiden.channel)  
  }).then(info => {
    let channelInfo = {
      block: info.block,
      deposit: state.uraiden.tkn2num(info.deposit), 
      withdrawn: state.uraiden.tkn2num(info.withdrawn),
      state: info.state
    }
    console.log('MicroRaiden: channel closed | receiver: ' + receiver + ', state: ' + channelInfo.state + ', deposited: ' + channelInfo.deposit + ', block: ' + channelInfo.block)
    resolve(store.dispatch(uraidenChannelUpdated({ channel: channelInfo })))
    store.dispatch(uraidenStatusUpdated({status: ''}))
    return getAccountBalance()
  }).catch(err => { 
    console.log(err); 
    store.dispatch(uraidenStatusUpdated({status: 'error during closing of channel'}))
    reject() 
  })
})

export const depositFunds = depositAmount => () => new Promise((resolve, reject) => {

  if (!depositAmount || depositAmount < 1) { depositAmount = 1 }

  store.dispatch(uraidenStatusUpdated({status: 'depositing funds ...'}))

  state.uraiden.topUpChannel(state.uraiden.num2tkn(depositAmount)).then(() => {
    return state.uraiden.getChannelInfo(state.uraiden.channel) 
  }).then(info => {
    let channelInfo = {
      block: info.block,
      deposit: state.uraiden.tkn2num(info.deposit), 
      withdrawn: state.uraiden.tkn2num(info.withdrawn),
      state: info.state
    }
    console.log('MicroRaiden: deposited funds into channel | receiver: ' + receiver + ', state: ' + channelInfo.state + ', deposited: ' + channelInfo.deposit + ', block: ' + channelInfo.block)
    resolve(store.dispatch(uraidenChannelUpdated({channel: channelInfo})))
    store.dispatch(uraidenStatusUpdated({status: ''}))
    return getAccountBalance()
  }).catch(error => {
    store.dispatch(uraidenStatusUpdated({status: ''}))
    reject(error)
  })
})

export const makePayment = price => () => new Promise((resolve, reject) => {

  if (price == null) { price = pricePerUnit }

  state.uraiden.incrementBalanceAndSign(state.uraiden.num2tkn(price)).then(signature => {

    let sender = state.uraiden.channel.account
    let openingBlock = state.uraiden.channel.block

    let formattedSignature = {...signature}
    formattedSignature['signature'] = formattedSignature.sig
    formattedSignature['balance'] = formattedSignature.balance.toNumber() 
    delete formattedSignature.sig

    return fetch(DOMAIN + PORT + '/api/1/channels/' + sender  + '/' + openingBlock + '/' + formattedSignature.balance, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedSignature),
    })
  }).then(response => {
    if (response.status === 200) { return state.uraiden.confirmPayment(state.uraiden.channel.next_proof) }
    throw(response)
  }).then(() => {
    return state.uraiden.getChannelInfo(state.uraiden.channel)
  }).then(info => {
    let channelInfo = {
      block: info.block,
      deposit: state.uraiden.tkn2num(info.deposit), 
      withdrawn: state.uraiden.tkn2num(info.withdrawn),
      state: info.state
    }
    console.log('MicroRaiden: made payment of ' + pricePerUnit + ' on channel | receiver: ' + receiver + ', state: ' + channelInfo.state + ', deposited: ' + channelInfo.deposit + ', block: ' + channelInfo.block)
    resolve(store.dispatch(uraidenChannelUpdated({ channel: channelInfo })))
  }).catch(error => reject(error))
})

export const getURaiden = () => new Promise((resolve, reject) => {

  state.uraiden = new MicroRaiden(store.getState().web3.web3Instance, contractAddress, contractABI, tokenAddress, tokenABI)
  resolve(store.dispatch(uraidenInitialized({ uraidenInstance: state.uraiden })))

  getAccountBalance().catch(error => console.log(error))
  loadChannel().catch(error => { console.log(error) })
})