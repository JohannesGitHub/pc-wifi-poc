import { createStore, compose, applyMiddleware } from 'redux'

import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'

import reducer from './reducers'

// Redux Middleware
const loggerMiddleware = createLogger({ collapsed: true })

const store = createStore(
  reducer,
  compose(
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware
    )
  )
)

export default store
