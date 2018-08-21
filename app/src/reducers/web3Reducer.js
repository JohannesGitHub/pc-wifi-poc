const initialState = {
  web3Instance: null,
	account: null,
	etherBalance: null,
  network: null,
  peerCount: null,
  transactions: {}
}

const web3Reducer = (state = initialState, action) => {
	switch(action.type) {
  	case 'WEB3_INITIALIZED': 
  		return {...state, web3Instance: action.payload.web3Instance} 
 		case 'WEB3_ACCOUNT_UPDATED':
			 return {...state, account: action.payload.account}
		case 'WEB3_ACCOUNT_BALANCE_UPDATED':
			return {...state, etherBalance: action.payload.etherBalance}
 		case 'WEB3_NETWORK_UPDATED':
 			return {...state, network: action.payload.network}
 		case 'WEB3_PEER_COUNT_UPDATED':
 			return {...state, peerCount: action.payload.peerCount}
    case 'WEB3_CONTRACT_INITIALIZED':
      return {...state, contract: action.payload.contract}
    case 'WEB3_SENT_TRANSACTION':
      return {...state, transactions: {...state.transactions, ...action.payload.transaction}}
 		default:
  		return state
  }
}

export default web3Reducer
	