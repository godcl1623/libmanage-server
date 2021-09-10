import React from 'react';
import axios from 'axios';
import { encryptor, decryptor } from '../../custom_modules/aeser';
import { hasher } from '../../custom_modules/hasher';
import { tracer } from '../../custom_modules/security/fes';
import FormSubmit from './module/FormSubmit';
import InputTemplate from './module/InputTemplate';

const Register = () => {
  const [pwdMatch, setPwdMatch] = React.useState(true);
  const [emailState, setEmailState] = React.useState('');
  const [idState, setIdState] = React.useState('');
  const [nickState, setNickState] = React.useState('');
  const [emailAuth, setEmailAuth] = React.useState('');

  const customOption = (state, func) => {
    if (state === 'others') {
      return <input type="text" name="email_provider" onChange={() => setEmailAuth('')}/>
    }
    return (
      <select name="email_provider" onChange={e => func(e.target.value)} >
        <option value="">선택</option>
        <option value="gmail.com">@gmail.com</option>
        <option value="naver.com">@naver.com</option>
        <option value="hanmail.net">@hanmail.net</option>
        <option value="others">직접 입력</option>
      </select>
    );
  };

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
          const inputs = Array.from(document.querySelectorAll('input'));
          const isEmpty = inputs.filter(input => input.value === '');
          const select = document.querySelector('select');
          const formData = {
            id: e.target.ID.value,
            pwd: hasher(e.target.PWD.value),
            nick: e.target.nickname.value,
            email: `${e.target.email_id.value}@${e.target.email_provider.value}`
          }
          const existCheck = async () => {
            await axios.post(
              'http://localhost:3002/member/register',
              {foo: encryptor(formData, tracer)},
              { withCredentials: true })
            .then(res => {
              const tempObj = decryptor(res.data, tracer);
              setIdState(tempObj.id);
              setNickState(tempObj.nick);
              setEmailAuth(tempObj.email);
            })
            .catch(err => alert(err));
          }
          if (select) {
            if (isEmpty[0] === undefined && select.value !== '') {
              existCheck();
            } else {
              alert('정보를 전부 입력해주세요');
            }
          } else if (isEmpty[0] === undefined) {
              existCheck();
          } else {
            alert('정보를 전부 입력해주세요');
          }
        }}
      >
        {/* <label htmlFor="ID">아이디: </label>
        <input type="text" name="ID" onChange={() => setIdState('')} /> */}
        <InputTemplate inputType="text" labelText="아이디: " inputFor="ID" handler={() => setIdState('')}/>
        <p
          style={{
            'color': 'red',
            'fontWeight': 'bold',
            'opacity': idState !== 1 ? '0' : '100%'
          }}
        >※ 이미 사용중인 ID입니다.</p>
        {/* <label htmlFor="PWD">비밀번호: </label>
        <input type="password" name="PWD" onChange={() => setPwdMatch(true)} /> */}
        <InputTemplate inputType="password" labelText="비밀번호: " inputFor="PWD" handler={() => setPwdMatch(true)}/>
        {/* <label htmlFor="PWD_check">비밀번호 확인: </label>
        <input type="password" name="PWD_check" onChange={() => setPwdMatch(true)} /> */}
        <InputTemplate inputType="password" labelText="비밀번호 확인: " inputFor="PWD_check" handler={() => setPwdMatch(true)}/>
        <p
          style={{
            'color': 'red',
            'fontWeight': 'bold',
            'opacity': pwdMatch ? '0' : '100%'
          }}
        >※ 비밀번호가 일치하지 않습니다.</p>
        {/* <label htmlFor="nickname">별명: </label>
        <input type="text" name="nickname" onChange={() => setNickState('')}/> */}
        <InputTemplate inputType="text" labelText="별명: " inputFor="nickname" handler={() => setNickState('')} />
        <p
          style={{
            'color': 'red',
            'fontWeight': 'bold',
            'opacity': nickState !== 1 ? '0' : '100%'
          }}
        >※ 이미 사용중인 별명입니다.</p>
        {/* <label htmlFor="email_id">이메일: </label>
        <input type="text" name="email_id" onChange={() => setEmailAuth('')} /> */}
        <InputTemplate inputType="text" labelText="이메일: " inputFor="email_id" handler={() => setEmailAuth('')} />
        <p>@</p>
        { customOption(emailState, setEmailState) }
        <p
          style={{
            'color': 'red',
            'fontWeight': 'bold',
            'opacity': emailAuth !== 1 ? '0' : '100%'
          }}
        >※ 이미 사용중인 이메일 주소입니다.</p>
        <FormSubmit />
      </form>
    </article>
  );
};

export default Register;