import React from 'react';

const Login = () => (
  <article
    id="login"
    style={{
      'display': 'flex',
      'flex-direction': 'column',
      'justify-content': 'center',
      'align-content': 'center'
    }}
  >
    <h2>libmanage</h2>
    <form
      action=""
      style={{
        'display': 'flex',
        'flex-direction': 'column',
        'justify-content': 'center',
        'align-content': 'center'
      }}
    >
      <label for="ID">ID: </label>
      <input type="text" name="ID" />
      <label for="PWD">PW: </label>
      <input type="password" name="PWD" />
      <button type="submit" name="login">LOGIN</button>
    </form>
    <button>ID/PW 찾기</button>
    <button>오프라인으로 접속</button>
  </article>
);

export default Login;