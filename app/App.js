import React from 'react';
import { Provider } from 'react-redux'

import 'babel-preset-react-native-web3/globals'

import store from './src/store'
import { getWeb3 } from './src/services/web3Service'
import { getURaiden } from './src/services/uraidenService'
import { getSocket } from './src/services/socketService'

import HomeContainer from './src/components/Home'

getWeb3().then(() => {
  return getURaiden()
}).then(() => {
  return getSocket()
}).catch(error => console.error(error))

const App = () => (
  <Provider store={store}>
    <HomeContainer />
  </Provider>
)

export default App
