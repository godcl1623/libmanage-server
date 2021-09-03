import React from 'react';
import axios from 'axios';
import { encryptor, decryptor } from '../../custom_modules/aeser';
import { hasher } from '../../custom_modules/hasher';
import { tracer, frost } from '../../custom_modules/security/fes';

const customOption = (state, func) => {
  if (state === 'others') return <input type="text" name="email_provider" />
  return (
    <select name="email_provider" onChange={e => func(e.target.value)} >
      <option value="">선택</option>
      <option value="google.com">@google.com</option>
      <option value="naver.com">@naver.com</option>
      <option value="hanmail.net">@hanmail.net</option>
      <option value="others">직접 입력</option>
    </select>
  );
};

const Register = () => {
  const [pwdMatch, setPwdMatch] = React.useState(true);
  const [emailState, setEmailState] = React.useState('');

  return (
    <article
      id="register"
      style={{
        'display': 'flex',
        'flexDirection': 'column',
        'justifyContent': 'center',
        'alignContent': 'center'
      }}
    >
      <form
        style={{
          'display': 'flex',
          'flexDirection': 'column',
          'justifyContent': 'center',
          'alignContent': 'center'
        }}
        onSubmit={e => {
          e.preventDefault();
          if (e.target.PWD.value !== e.target.PWD_check.value) {
            setPwdMatch(false);
          }
          if (e.target.email_provider.value[0] === '@') {
            const temp = Array.from(e.target.email_provider.value);
            temp.shift();
            e.target.email_provider.value = temp.join('');
          }
          const formData = {
            id: e.target.ID.value,
            pwd: e.target.PWD.value,
            nick: e.target.nickname.value,
            email: `${e.target.email_id.value}@${e.target.email_provider.value}`
          }
          if (formData.id !== '' && formData.pwd !== '' && formData.nick !== '' && e.target.email_id.value !== '' && e.target.email_provider.value !== '') {
            axios.get('http://localhost:3002/test_get')
              .then(res => {
                const tempObj = JSON.parse(decryptor(res.data, tracer));
                console.log(decryptor(tempObj.id, frost));
              });
          } else {
            alert('정보를 전부 입력해주세요');
          }
        }}
      >
        <label htmlFor="ID">아이디: </label>
        <input type="text" name="ID" />
        <label htmlFor="PWD">비밀번호: </label>
        <input type="password" name="PWD" onChange={() => setPwdMatch(true)} />
        <label htmlFor="PWD_check">비밀번호 확인: </label>
        <input type="password" name="PWD_check" onChange={() => setPwdMatch(true)} />
        <p
          style={{
            'color': 'red',
            'fontWeight': 'bold',
            'opacity': pwdMatch ? '0' : '100%'
          }}
        >※ 비밀번호가 일치하지 않습니다.</p>
        <label htmlFor="nickname">별명: </label>
        <input type="text" name="nickname" />
        <label htmlFor="email_id">이메일: </label>
        <input type="text" name="email_id" />
        <p>@</p>
        { customOption(emailState, setEmailState) }
        <button name="cancel">취소</button>
        <button type="submit" name="confirm">확인</button>
      </form>
    </article>
  );
};

export default Register;