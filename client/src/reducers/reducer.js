const loginStatusReducer = (status = '', action) => {
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

const tempStore = {
  loginStatusReducer, logoutClickedReducer
}

export default tempStore;