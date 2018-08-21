const initialState = {
	uraidenInstance: null,
	channel: null,
	tknBalance: null
}

const uraidenReducer = (state = initialState, action) => {
	switch(action.type) {
  	case 'URAIDEN_INITIALIZED': 
			return {...state, uraidenInstance: action.payload.uraidenInstance} 
		case 'URAIDEN_ACCOUNT_BALANCE_UPDATED': 
			return {...state, tknBalance: action.payload.tknBalance}	
		case 'URAIDEN_CHANNEL_UPDATED': 
			return {...state, channel: action.payload.channel}
			case 'URAIDEN_STATUS_UPDATED': 
		return {...state, status: action.payload.status}	
 		default:
  		return state
  }
}

export default uraidenReducer
	