import React from 'react';
import axios from 'axios';
import InputTemplate from './InputTemplate';
import FormSubmit from './FormSubmit';
import { encryptor } from '../../../custom_modules/aeser';
import { tracer } from '../../../custom_modules/security/fes';
import { hasher } from '../../../custom_modules/hasher';

const ChangePwd = ({ token }) => {
  const [pwdMatch, setPwdMatch] = React.useState(true);
  const { userId } = token;
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        const pwd = e.target.PWD.value;
        const pwdCheck = e.target.PWD_check.value;
        const inputs = Array.from(document.querySelectorAll('input'));
        const isEmpty = inputs.filter(input => input.value === '');
        const formData = {};
        if (isEmpty[0] !== undefined) {
          alert('정보를 전부 입력해주세요');
        } else if (pwd !== pwdCheck) {
          setPwdMatch(false);
        } else {
          formData.id = userId;
          formData.pwd = hasher(pwd);
          axios.post('http://localhost:3002/member/reset/pwd', { formData: encryptor(formData, tracer) }, {withCredentials: true})
            .then(res => console.log(res))
            .catch(err => alert(err));
        }
      }}
    >
      <InputTemplate inputType="password" labelText="변경할 비밀번호: " inputFor="PWD" handler={() => setPwdMatch(true)}/>
      <p
          style={{
            'color': 'red',
            'fontWeight': 'bold',
            'opacity': pwdMatch ? '0' : '100%'
          }}
        >※ 비밀번호가 일치하지 않습니다.</p>
      <InputTemplate inputType="password" labelText="비밀번호 확인: " inputFor="PWD_check" handler={() => setPwdMatch(true)}/>
      <FormSubmit />
    </form>
  );
};

export default ChangePwd;