import React from 'react';

const Login = () => (
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
      action="/login_process"
      style={{
        'display': 'flex',
        'flexDirection': 'column',
        'justifyContent': 'center',
        'alignContent': 'center'
      }}
      onSubmit={e => {
        e.preventDefault();
        fetch()
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

export default Login;