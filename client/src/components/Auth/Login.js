import React from 'react';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = React.useState({});

  const handleChange = e => {
    const {name, value} = e.target;
    setFormData(prevValue => ({
      ...prevValue,
      [name]: value
    }));
  };

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
          axios.post('http://localhost:3002/test', formData)
          .then(res => console.log(res))
          .catch(err => console.log(err));
          // axios.post('http://localhost:3002/test', loginInfo)
          // .then(() => console.log('foo'))
          // .catch(err => console.log(err));
          // console.log(e.target.elements.ID.value)
          // console.log(e.target.elements.PWD.value)
        }}
      >
        <label htmlFor="ID">ID: </label>
        <input type="text" name="ID" onChange={handleChange} />
        <label htmlFor="PWD">PW: </label>
        <input type="password" name="PWD" onChange={handleChange} />
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