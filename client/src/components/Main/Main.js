/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Library from './Library';
import Meta from './Meta';
import Navigation from './Navigation';
import Modal from '../Modal/Modal';
import { loginStatusCreator, userStateCreator, balloonStateCreator } from '../../actions';

const Main = () => {
  const loginStatus = useSelector(state => state.loginStatus);
  const logoutClicked = useSelector(state => state.logoutClicked);
  const balloonState = useSelector(state => state.balloonState);
  const userState = useSelector(state => state.userState);
  const dispatch = useDispatch();
  const history = useHistory();

  React.useEffect(() => {
    axios.post('http://localhost:3002/check_login', { message: 'isLoginSuccessful' }, { withCredentials: true })
      .then(res => {
        if (res.data.isLoginSuccessful) {
          dispatch(loginStatusCreator(res.data.isLoginSuccessful));
          if (userState.nickname === undefined) {
            dispatch(userStateCreator(res.data));
          }
        } else if (res.data.isGuest) {
          // 임시로 작성
          dispatch(loginStatusCreator(true));
          if (userState.nickname === undefined) {
            dispatch(userStateCreator(res.data));
          }
        } else {
          alert('로그인이 필요합니다');
          history.push('/');
        }
      })
      .catch(err => console.log(err));
  }, []);

  if (loginStatus === false && logoutClicked === false) {
    return(<></>);
  } 

  return (
    <>
      <main
        id="main"
        style={{
          'width': '100%',
          'height': '100vh',
          'display': 'flex',
          'flexDirection': 'column',
          'justifyContent': 'center',
          'alignContent': 'center'
        }}
        onClick={e => {
          e.preventDefault();
          console.log(e)
          if (balloonState !== 'none' && e.target.id === 'balloon') {
            dispatch(balloonStateCreator('none'));
          }
        }}
      >
        <Header />
        <div
          id="main-contents"
          style={{
            'width': '100%',
            'height': '100%',
            'display': 'flex',
            'justifyContent': 'center',
            'alignContent': 'center'
          }}
        >
          <Navigation />
          <Library />
          <Meta />
        </div>
      </main>
      <Modal />
    </>
  );
};

export default Main;