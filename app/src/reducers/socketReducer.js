const initialState = {
	socketInstance: null
}

const socketReducer = (state = initialState, action) => {
	switch(action.type) {
  	case 'SOCKET_INITIALIZED': 
			return {...state, socketInstance: action.payload.socketInstance} 
 		default:
  		return state
  }
}

export default socketReducer
	