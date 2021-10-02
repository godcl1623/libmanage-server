import { combineReducers } from 'redux';
import tempStore from './reducer';

export default combineReducers({
  loginStatus:tempStore.loginStatusReducer,
  logoutClicked: tempStore.logoutClickedReducer,
  tokenState: tempStore.tokenStateReducer,
  userState: tempStore.userStateReducer,
  modalState: tempStore.modalStateReducer,
  balloonState: tempStore.balloonStateReducer,
  balloonOrigin: tempStore.balloonOriginReducer,
  _TEST: tempStore._TESTREDUCER
});