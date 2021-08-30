const loginStatusReducer = (status = '', action) => {
  if (action.type === 'LOGIN_STATUS') {
    return action.payload;
  }
  return status;
}

export default loginStatusReducer;