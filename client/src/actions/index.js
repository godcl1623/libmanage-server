export const loginStatusCreator = boolean => ({
  type: 'LOGIN_STATUS',
  payload: boolean  
});

export const logoutClickedCreator = boolean => ({
  type: 'LOGOUT_CLICKED',
  payload: boolean
});

export const tokenStateCreator = string => ({
  type: 'TOKEN_STATE',
  payload: string
});

export const userStateCreator = obj => ({
  type: 'USER_STATE',
  payload: obj
});