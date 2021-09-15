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

const userStateReducer = (status = {}, action) => {
  if (action.type === 'USER_STATE') {
    return {
      ...status,
      ...action.payload
    }
  }
  return status;
};

const tempStore = {
  loginStatusReducer, logoutClickedReducer, tokenStateReducer, userStateReducer
}

export default tempStore;