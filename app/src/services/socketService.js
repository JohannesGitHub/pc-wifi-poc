import store from '../store'
import SocketIOClient from 'socket.io-client'
import Sound from 'react-native-sound'

import { makePayment } from './uraidenService'

Sound.setCategory('Playback')

const DOMAIN = 'http://192.168.255.1'
const PORT = ':9000'

let state = { socket: null }

export const SOCKET_INITIALIZED = 'SOCKET_INITIALIZED'
function socketInitialized(results) {
  return {
    type: SOCKET_INITIALIZED,
    payload: results
  }
}

export const getSocket = () => new Promise((resolve, reject) => {

  let audio = new Sound('silence.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) { console.log('failed to load the sound', error); return }
    
    audio.setNumberOfLoops(-1)
    audio.play(success => { if (!success) { audio.reset() } })
  })

  state.socket = SocketIOClient(DOMAIN + PORT)

  state.socket.on('connect', () => {
    console.log('connected to access point')
    state.socket.emit('openSession', {ethereumAddress: store.getState().web3.account})
  })

  state.socket.on('requestPayment', msg => {
    if (msg['recipient'] === store.getState().web3.account) {
      store.dispatch(makePayment())
    }
  })

  state.socket.on('revokedAccess', msg => {
    console.log('access revoked')
  })

  state.socket.on('closeChannel', msg => {
    console.log(msg)
  })
  
  resolve(store.dispatch(socketInitialized({ socketInstance: state.socket })))
})