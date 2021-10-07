/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Library from './Library';
import Meta from './Meta';
import Navigation from './Navigation';
import Modal from '../Modal/Modal';
import {
  loginStatusCreator,
  userStateCreator,
  balloonStateCreator,
  comparisonStateCreator,
  modalStateCreator
} from '../../actions';

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

const modalContents = (state, dispatch, setState1, setState2) => {
  // 모든 스토어에 대응 가능하도록 개선 필요
  if (state.stores === undefined || state.stores.game.steam === false) {
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
              // 반영을 위해서는 comparisonState 변경이 필요
              dispatch(setState1(temp));
              axios.post('http://localhost:3003/disconnect', { reqUserInfo: JSON.stringify(state) }, {withCredentials: true})
                .then(res => {
                  if (res) {
                    dispatch(setState2(false));
                  }
                });
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
  const comparisonState = useSelector(state => state.comparisonState);
  const [storesList, setStoresList] = useState('');
  const [userLibrary, setUserLibrary] = useState('');
  const dispatch = useDispatch();
  const history = useHistory();

  React.useEffect(() => {
    if (comparisonState.stores !== undefined && userState.stores === undefined) {
      dispatch(userStateCreator(comparisonState));
    }
  }, []);

  React.useEffect(() => {
    const checkLogin = () => {
      axios.post('http://localhost:3002/check_login', { message: comparisonState }, { withCredentials: true })
        .then(res => {
          if (res.data.isLoginSuccessful) {
            dispatch(loginStatusCreator(res.data.isLoginSuccessful));
            if (userState.nickname === undefined) {
              dispatch(userStateCreator(res.data));
              dispatch(comparisonStateCreator(''));
            }
          } else if (res.data.isGuest) {
            // 임시로 작성
            dispatch(loginStatusCreator(true));
            if (userState.nickname === undefined) {
              dispatch(userStateCreator(res.data));
              dispatch(comparisonStateCreator(''));
            }
          } else {
            alert('로그인이 필요합니다');
            history.push('/');
          }
        })
        .catch(err => console.log(err));
    }
    if (comparisonState !== '') {
      checkLogin();
    }
    checkLogin();
    }, [comparisonState]);

    React.useEffect(() => {
      const { stores } = userState;
      if (stores !== undefined) {
        const categories = Object.keys(stores);
        const eachStoresOfCategories = categories.map(ele => Object.keys(stores[ele]));
        const eachStatusOfStoresOfCategories = categories.map(ele => Object.values(stores[ele]));
        const activatedStores = eachStatusOfStoresOfCategories
          .map(storeStat => storeStat
            .map((ele, index) => ele === true ? index : '')
            .filter(ele => ele !== '')
          );
        const storesToDisplay = activatedStores
          .map(
            (status, index) => status.map(iTrue => eachStoresOfCategories[index][iTrue])
          );
        setStoresList(storesToDisplay);
      }
    }, [userState.stores]);

    React.useEffect(() => {
      const dataToSend = {
        reqUser: userState.nickname,
        reqLibs: storesList
      }
      if (dataToSend.reqLibs !== '') {
        axios.post('http://localhost:3003/get/db', { reqData: dataToSend }, { withCredentials: true })
          .then(res => setUserLibrary(res.data));
      }
    }, [storesList]);

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
          <Navigation storesList={storesList} />
          <Library userLib={userLibrary} />
          <Meta />
        </div>
      </main>
      <Modal
        style={modalOption}
        contents={
          () => modalContents(userState, dispatch, comparisonStateCreator, modalStateCreator)
        }
      />
    </>
  );
};

export default Main;