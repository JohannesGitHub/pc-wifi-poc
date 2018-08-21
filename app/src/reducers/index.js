import { combineReducers } from 'redux'

import web3Reducer from './web3Reducer'
import uraidenReducer from './uraidenReducer'
import socketReducer from './socketReducer'

const reducer = combineReducers({
  web3: web3Reducer,
  uraiden: uraidenReducer,
  socket: socketReducer
})

export default reducer