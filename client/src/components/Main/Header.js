import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Balloon from '../Modal/Balloon';
import {
  loginStatusCreator,
  logoutClickedCreator,
  modalStateCreator,
  balloonStateCreator,
  balloonOriginCreator
} from '../../actions';

const Header = () => {
  const loginStatus = useSelector(state => state.loginStatus);
  const userState = useSelector(state => state.userState);
  const modalState = useSelector(state => state.modalState);
  const balloonState = useSelector(state => state.balloonState);
  const balloonOrigin = useSelector(state => state.balloonOrigin);
  // const [balloonState, setBalloonState] = useState('none');
  const history = useHistory();
  const dispatch = useDispatch();

  const Options = () => (
    <>
      {/* <button
        style={{
          'width': '80%',
          'height': '50%'
        }}
        onClick={() => {
          if (!modalState) {
            dispatch(modalStateCreator(true))
          } else {
            dispatch(modalStateCreator(false))
          }
        }}
      >스토어 추가</button> */}
      <button
        style={{
          'width': '80%',
          'height': '50%'
        }}
        onClick={() => {
          if (!modalState) {
            dispatch(modalStateCreator(true));
            dispatch(balloonStateCreator('none'));
          } else {
            dispatch(modalStateCreator(false));
          }
        }}
      >라이브러리 추가</button>
    </>
  );

  const memberStatus = (
    loginStatus === true
      ?
        <button
        onClick={() => {
            dispatch(logoutClickedCreator(true));
            axios.post('http://localhost:3002/logout_process', {message: 'foo'}, { withCredentials: true })
              .then(res => {
                dispatch(loginStatusCreator(res.data.isLoginSuccessful));
                setTimeout(() => {
                  alert('로그아웃 했습니다.');
                  history.push('/');
                }, 10);
              })
              .catch(err => alert(err));
          }}
        >
          로그아웃
        </button>
      :
        <button
          onClick={() => {
            history.push('/');
          }}
        >
          로그인
        </button>
  );
  
  const wrapper = {
    'display': balloonOrigin === 'Header' ? balloonState : 'none',
    'position': 'absolute',
    'top': '0',
    'left': '0',
    // 'background': 'rgba(0, 0, 0, 0.3)',
    'width': '100%',
    'height': '100%',
    'zIndex': '1'
  }

  const style = {
    'padding': '20px',
    'display': balloonOrigin === 'Header' ? balloonState : 'none',
    'flexDirection': 'column',
    'justifyContent': 'center',
    'alignItems': 'center',
    'width': '300px',
    'height': '100px',
    'position': 'absolute',
    'top': '0',
    'left': '200px',
    'background': 'white',
    'zIndex': 1
  };

  const hand = {
    'width': '50px',
    'height': '50px',
    'position': 'absolute',
    'top': '0',
    'left': '176px',
    'transform': 'translate(-50%)',
    'background': 'white',
    'display': balloonOrigin === 'Header' ? balloonState : 'none'
  }

  return (
    <header
      id="header"
      style={{
        'display': 'flex',
        'justifyContent': 'space-between',
        'alignContent': 'center'
      }}
    >
      <button
        onClick={() => {
          dispatch(balloonOriginCreator('Header'));
          if (balloonState === 'none') {
            dispatch(balloonStateCreator('flex'));
          } else if (balloonOrigin === 'Header') {
            dispatch(balloonStateCreator('none'));
          }
        }}
      >옵션</button>
      <Balloon contents={<Options />} display={wrapper} style={style} hand={hand} />
      <form>
        <input type="text" placeholder="검색어를 입력하세요" />
        <button>검색</button>
        <button>검색옵션</button>
      </form>
      {/* <button>로그인</button> */}
      { userState.nickname }
      { memberStatus }
    </header>
  );
};

export default Header;