const loginStatusReducer = (status = false, action) => {
  if (action.type === 'LOGIN_STATUS') {
    return action.payload;
  }
  return status;
};

const logoutClickedReducer = (status = false, action) => {
  if (action.type === 'LOGOUT_CLICKED') {
    return action.payload;
  }
  return status;
};

const tokenStateReducer = (status = '', action) => {
  if (action.type === 'TOKEN_STATE') {
    return action.payload;
  }
  return status;
};

const userStateReducer = (status = {}, action) => {
  if (action.type === 'USER_STATE' && action.payload !== null) {
    return {
      // ...status,
      ...action.payload
    }
  // eslint-disable-next-line no-else-return
  } else if (action.type === 'USER_STATE' && action.payload === null) {
    return {};
  }
  return status;
};

const modalStateReducer = (status = false, action) => {
  if (action.type === 'MODAL_STATE') {
    return action.payload;
  }
  return status;
};

const balloonStateReducer = (state = 'none', action) => {
  if (action.type === 'BALLOON_STATE') {
    return action.payload;
  }
  return state;
};

const balloonOriginReducer = (state = '', action) => {
  if (action.type === 'BALLOON_ORIGIN') {
    return action.payload;
  }
  return state;
};

const comparisonStateReducer = (state = '', action) => {
  if (action.type === 'COMPARE_STATE') {
    return action.payload;
  }
  return state;
};

const libDisplayStateReducer = (state = 'list', action) => {
  if (action.type === 'LIBRARY_DISPLAY') {
    return action.payload;
  }
  return state;
};

const _TESTREDUCER = (state = '', action) => {
  if (action.type === '__TEST__') {
    return action.payload;
  }
  return state;
};

const tempStore = {
  loginStatusReducer,
  logoutClickedReducer,
  tokenStateReducer,
  userStateReducer,
  modalStateReducer,
  balloonStateReducer,
  balloonOriginReducer,
  comparisonStateReducer,
  libDisplayStateReducer,
  _TESTREDUCER
};

export default tempStore;