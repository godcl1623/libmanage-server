/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { loginStatusCreator } from '../../actions';
import { hasher, salter } from '../../custom_modules/hasher';
import { encryptor, decryptor } from '../../custom_modules/aeser';
import { tracer, frost } from '../../custom_modules/security/fes';

const Login = () => {
  const loginStatus = useSelector(state => state.loginStatus);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    axios.post('http://localhost:3002/check_login', {}, { withCredentials: true })
    .then(res => {
      if (res.data.isLoginSuccessful) {
        dispatch(loginStatusCreator(res.data.isLoginSuccessful));
        history.push('/main');
      }
    })
    .catch(err => alert(err));
  }, []);

  if (loginStatus) {
    return <></>;
  }

  return (
    <article
      id="login"
      style={{
        'display': 'flex',
        'flexDirection': 'column',
        'justifyContent': 'center',
        'alignContent': 'center'
      }}
    >
      <h2>libmanage</h2>
      <form
        // action="/test"
        style={{
          'display': 'flex',
          'flexDirection': 'column',
          'justifyContent': 'center',
          'alignContent': 'center'
        }}
        onSubmit={e => {
          e.preventDefault();
          const formData = {
            ID: '',
            PWD: ''
          }
          if (e.target.ID.value !== '' && e.target.PWD.value !== '') {
            formData.ID =  encryptor(e.target.ID.value, tracer);
            formData.PWD = encryptor(salter(hasher(e.target.PWD.value)), tracer);
          }
          axios.post('http://localhost:3002/login_process', formData, { withCredentials: true })
          .then(res => {
            if (res.data.isLoginSuccessful) {
              dispatch(loginStatusCreator(res.data.isLoginSuccessful));
              alert(`${res.data.nickname}님, 로그인에 성공했습니다.`);
              history.push('/main');
            } else {
              alert(res.data);
            }
          })
          .catch(err => alert(err));
        }}
      >
        <label htmlFor="ID">ID: </label>
        <input type="text" name="ID" />
        <label htmlFor="PWD">PW: </label>
        <input type="password" name="PWD" />
        <button type="submit" name="login">LOGIN</button>
      </form>
      <div className="member">
        <button>회원가입</button>
        <button>ID/PW 찾기</button>
      </div>
      <button>오프라인으로 접속</button>
    </article>
    );
};

export default Login;