import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Balloon from '../Modal/Balloon';
import { loginStatusCreator, logoutClickedCreator, modalStateCreator } from '../../actions';



const Header = () => {
  const loginStatus = useSelector(state => state.loginStatus);
  const userState = useSelector(state => state.userState);
  const modalState = useSelector(state => state.modalState);
  const [balloonState, setBalloonState] = useState('none');
  const history = useHistory();
  const dispatch = useDispatch();

  const Options = () => (
    <>
      <button
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
      >스토어 추가</button>
      <button
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
    'display': balloonState,
    'position': 'absolute',
    'top': '0',
    'left': '100px'
  }

  const style = {
    'padding': '20px',
    'display': balloonState,
    'flexDirection': 'column',
    'justifyContent': 'center',
    'alignItems': 'center',
    'width': '300px',
    'height': '100px',
    'position': 'absolute',
    'top': '0',
    'left': '100px',
    'background': 'white',
    'zIndex': 1
  };

  const hand = {
    'width': '50px',
    'height': '50px',
    'position': 'absolute',
    'top': '0',
    'left': '100px',
    'transform': 'translate(-50%)',
    'background': 'white',
    'display': balloonState
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
          if (balloonState === 'none') {
            setBalloonState('flex');
          } else {
            setBalloonState('none');
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