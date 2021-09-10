/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { loginStatusCreator } from '../../actions';
import { hasher, salter } from '../../custom_modules/hasher';
import { encryptor } from '../../custom_modules/aeser';
import { tracer } from '../../custom_modules/security/fes';

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
      } else {
        // alert(res.data);
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
            formData.ID =  e.target.ID.value;
            formData.PWD = salter(hasher(e.target.PWD.value));
          }
          axios.post('http://localhost:3002/login_process', {sofo: encryptor(formData, tracer)}, { withCredentials: true })
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
        <Link to="/member/register">회원가입</Link>
        <Link to="/member/find">ID/PW 찾기</Link>
      </div>
      <button>오프라인으로 접속</button>
    </article>
    );
};

export default Login;