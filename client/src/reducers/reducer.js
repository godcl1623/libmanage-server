const loginStatusReducer = (status = false, action) => {
  if (action.type === 'LOGIN_STATUS') {
    return action.payload;
  }
  return status;
}

const logoutClickedReducer = (status = false, action) => {
  if (action.type === 'LOGOUT_CLICKED') {
    return action.payload;
  }
  return status;
}

const tokenStateReducer = (status = '', action) => {
  if (action.type === 'TOKEN_STATE') {
    return action.payload;
  }
  return status;
}

const tempStore = {
  loginStatusReducer, logoutClickedReducer, tokenStateReducer
}

export default tempStore;