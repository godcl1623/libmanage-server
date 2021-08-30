import { combineReducers } from 'redux';
import loginStatusReducer from './reducer';

export default combineReducers({
  loginStatus: loginStatusReducer
});