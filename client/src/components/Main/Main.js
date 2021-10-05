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
import { loginStatusCreator, userStateCreator, balloonStateCreator, _TESTCREATOR } from '../../actions';

const modalOption = {
  'position': 'absolute',
  'width': '50%',
  'height': '50%',
  'background': 'white',
  'top': '50%',
  'left': '50%',
  'transform': 'translate(-50%, -50%)',
  'zIndex': '2'
}

const modalContents = (state, dispatch, setState) => {
  if (state.stores === undefined) {
    return (
      <article>
        <h2>스토어 목록</h2>
        <hr />
        <section className="store_container">
          <h3>스팀</h3>
          <a
            href="http://localhost:3003/auth/steam"
            // target="_blank"
            // rel="noreferrer"
          >스팀으로 로그인</a>
        </section>
      </article>
    );
  // eslint-disable-next-line no-else-return
  } else {
    return (
      <article>
        <h2>스토어 목록</h2>
        <hr />
        <section className="store_container">
          <h3>스팀</h3>
          <button
            onClick={e => {
              const temp = state;
              temp.stores.game.steam = false;
              // 반영을 위해서는 testState 변경이 필요
              dispatch(setState(temp));
              axios.post('http://localhost:3003/disconnect', { reqUserInfo: JSON.stringify(state) }, {withCredentials: true})
                .then(res => console.log(res));
            }}
          >연동 해제</button>
        </section>
      </article>
    );
  }
};

const Main = () => {
  const loginStatus = useSelector(state => state.loginStatus);
  const logoutClicked = useSelector(state => state.logoutClicked);
  const balloonState = useSelector(state => state.balloonState);
  const userState = useSelector(state => state.userState);
  const testState = useSelector(state => state._TEST);
  const dispatch = useDispatch();
  const history = useHistory();

  React.useEffect(() => {
    if (testState.stores !== undefined && userState.stores === undefined) {
      dispatch(userStateCreator(testState));
    }
  }, [])

  React.useEffect(() => {
    axios.post('http://localhost:3002/check_login', { message: testState }, { withCredentials: true })
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
          // e.preventDefault();
          // console.log(e)
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
      <Modal style={modalOption} contents={() => modalContents(userState, dispatch, _TESTCREATOR)} />
    </>
  );
};

export default Main;