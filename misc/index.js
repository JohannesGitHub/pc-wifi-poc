/**
 * for testing
 * run node index.js to get erc20 tokens for microraiden
 */

const Web3 = require('web3')

const ZeroClientProvider = require('web3-provider-engine/zero.js')
const sigUtil = require('eth-sig-util')
const ethUtil = require('ethereumjs-util')
const EthTx = require('ethereumjs-tx')

const address = ethUtil.toChecksumAddress('')
const privateKey = Buffer.from('', 'hex')

// ropsten testnet contract addresses
const tokenAddress = '0xff24d15afb9eb080c089053be99881dd18aa1090'
const tokenABI = require('./Token.json')
const contractAddress = '0x74434527b8e6c8296506d61d0faf3d18c9e4649a'
const contractABI = require('./RaidenMicroTransferChannels.json')

const providers = ['localhost:8545', 'http://192.168.255.1:8545', 'https://ropsten.infura.io']

let state = { web3: null }

const getWeb3 = () => {

  const engine = ZeroClientProvider({
    rpcUrl: providers[2],
    getAccounts: cb => { 
      cb(null, [address]) 
    },
    signTransaction: (txParams, cb) => { 
      if (txParams.gas !== undefined) txParams.gasLimit = txParams.gas
      txParams.value = txParams.value || '0x00'
      txParams.data = ethUtil.addHexPrefix(txParams.data)
      const tx = new EthTx(txParams)
      tx.sign(privateKey)
      cb(null, '0x'+tx.serialize().toString('hex')) 
    }, 
    signTypedMessage: (msgParams, cb) => {
      const serialized = sigUtil.signTypedData(privateKey, msgParams)
      cb(null, serialized)
    },
    signMessage: (msgParams, cb) => {
      const msgHash = ethUtil.sha3(msgParams.data)
      const sig = ethUtil.ecsign(msgHash, privateKey)
      const serialized = ethUtil.bufferToHex(sigUtil.concatSig(sig.v, sig.r, sig.s))
      cb(null, serialized)
    }
  })
  
  state.web3 = new Web3(engine)
}

const getTokens = () => new Promise((resolve, reject) => {
  const tokenContract = state.web3.eth.contract(tokenABI).at(tokenAddress)
  tokenContract.mint.sendTransaction({value: state.web3.toWei(101, 'finney'), gasPrice: state.web3.toWei(2, 'gwei'), gas: 3000000, from: address}, (err, res) => {
    if (err) { return reject(err) }
    console.log('Send Transaction: ' + res)
    transactionListener(res).then(tx => {
      if (tx.status !== '0x1') { throw(tx) }
      return resolve()
    }).catch(error => reject(error))
  })
})

const getTokenBalance = () => new Promise((resolve, reject) => {
  const tokenContract = state.web3.eth.contract(tokenABI).at(tokenAddress)
  tokenContract.balanceOf(address, (err, res) => {
    if (err) { return reject(err) }
    resolve(res.toString())
  })
})

const getAllEvents = () => {
  const contract = state.web3.eth.contract(contractABI).at(contractAddress)
  const events = contract.allEvents([])
  events.watch((error, event) => {
    if (error) { return console.log(errror) }
    console.log(event)
  })
}

const transactionListener = (txHash) => new Promise((resolve, reject) => {
  let listener = setInterval(() => { 
    state.web3.eth.getTransactionReceipt(txHash, (error, result) => {
      if (error) { return reject(error) }
      if (result != null) { 
        clearInterval(listener)
        return resolve(result) 
      }
    })
  }, 2000)
})

getWeb3()

// getTokenBalance()
// .then(balance => console.log(balance))
// .catch(error => console.error(error))

// getAllEvents()

getTokens().then(() => { 
  console.log('tokens minted!')
  return getTokenBalance()
}).then(balance => {
  console.log(balance)
  process.exit() 
}).catch(error => console.error(error))