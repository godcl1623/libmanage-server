import React, { useState } from 'react';
import axios from 'axios';
import { encryptor, decryptor } from '../../custom_modules/aeser';
import { hasher } from '../../custom_modules/hasher';
import { tracer } from '../../custom_modules/security/fes';
import FormSubmit from './module/components/FormSubmit';
import InputTemplate from './module/components/InputTemplate';
import { verifyId, verifyPwd, verifyNick, verifyEmail } from './module/utils';

const Register = () => {
  const [pwdMatch, setPwdMatch] = useState(true);
  const [emailState, setEmailState] = useState('');
  const [idState, setIdState] = useState('');
  const [pwdState, setPwdState] = useState('');
  const [nickState, setNickState] = useState('');
  const [emailAuth, setEmailAuth] = useState('');

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

  const verifyTest = (verifyValue, verifyState) => {
    if (verifyValue !== '비밀번호') {
      if (verifyState === 1) {
        return `※ 이미 사용중인 ${verifyValue}입니다.`;
      }
      if (verifyState === 'wrong') {
        return `※ ${verifyValue} 형식과 맞지 않습니다.`;
      }
    } else if (verifyState === 'wrong') {
      return `※ ${verifyValue} 형식과 맞지 않습니다.`;
    }
    return '　';
  }

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
            pwd: e.target.PWD.value,
            nick: e.target.nickname.value,
            email: `${e.target.email_id.value}@${e.target.email_provider.value}`
          }
          const sofo = {}
          const checkInputVal = (id, pwd, nick, email) => {
            let isValid = true;
            if (verifyId(id) && verifyPwd(pwd) && verifyNick(nick) && verifyEmail(email)) {
              setIdState('');
              setPwdState('');
              setNickState('');
              setEmailAuth('');
              isValid=true;
            }
            if (!verifyId(id)) {
              setIdState('wrong');
              isValid=false;
            }
            if (!verifyPwd(pwd)) {
              setPwdState('wrong');
              isValid=false;
            }
            if (!verifyNick(nick)) {
              setNickState('wrong');
              isValid=false;
            }
            if (!verifyEmail(email)) {
              setEmailAuth('wrong');
              isValid=false;
            }
            return isValid;
          };
          const existCheck = async sofo => {
            await axios.post(
              'http://localhost:3002/member/register',
              {foo: encryptor(sofo, tracer)},
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
              if (checkInputVal(formData.id, formData.pwd, formData.nick, formData.email)) {
                sofo.id = formData.id;
                sofo.pwd = hasher(formData.pwd);
                sofo.nick = formData.nick;
                sofo.email = formData.email;
                // existCheck(sofo);
                console.log(sofo);
              }
            } else {
              alert('정보를 전부 입력해주세요');
            }
          } else if (isEmpty[0] === undefined) {
            if (checkInputVal(formData.id, formData.pwd, formData.nick, formData.email)) {
              sofo.id = formData.id;
              sofo.pwd = hasher(formData.pwd);
              sofo.nick = formData.nick;
              sofo.email = formData.email;
              // existCheck(sofo);
              console.log(sofo);
            }
          } else {
            alert('정보를 전부 입력해주세요');
          }
        }}
      >
        <InputTemplate
          inputType="text"
          labelText="아이디: "
          inputFor="ID"
          handler={() => setIdState('')}
          placeholder='아이디 (6~12자 이내, 영문, 숫자 사용 가능)'
        />
        <p
          style={{
            'color': 'red',
            'fontWeight': 'bold',
            'opacity': (idState !== 1 && idState !== 'wrong') ? '0' : '100%'
          }}
        >{verifyTest('ID', idState)}</p>
        <InputTemplate
          inputType="password"
          labelText="비밀번호: "
          inputFor="PWD"
          handler={() => {
            setPwdMatch(true);
            setPwdState('');
          }}
          placeholder='비밀번호 (8~16자 이내, 영문 대소문자/숫자/기호(!,@,#,$,%,^,&,*)를 모두 포함해야 합니다.)'
        />
        <p
          style={{
            'color': 'red',
            'fontWeight': 'bold',
            'opacity': pwdState !== 'wrong' ? '0' : '100%'
          }}
        >{verifyTest('비밀번호', pwdState)}</p>
        <InputTemplate
          inputType="password"
          labelText="비밀번호 확인: "
          inputFor="PWD_check"
          handler={() => setPwdMatch(true)}
          placeholder='비밀번호를 한 번 더 입력해주세요.'
        />
        <p
          style={{
            'color': 'red',
            'fontWeight': 'bold',
            'opacity': pwdMatch ? '0' : '100%'
          }}
        >※ 비밀번호가 일치하지 않습니다.</p>
        <InputTemplate
          inputType="text"
          labelText="별명: "
          inputFor="nickname"
          handler={() => setNickState('')}
          placeholder='별명 (2~10자 이내, 한글/영문 대소문자/숫자 사용 가능)'
        />
        <p
          style={{
            'color': 'red',
            'fontWeight': 'bold',
            'opacity': (nickState !== 1 && nickState !== 'wrong') ? '0' : '100%'
          }}
        >{ verifyTest('별명', nickState) }</p>
        {/* <label htmlFor="email_id">이메일: </label>
        <input type="text" name="email_id" onChange={() => setEmailAuth('')} /> */}
        <InputTemplate inputType="text" labelText="이메일: " inputFor="email_id" handler={() => setEmailAuth('')} />
        <p>@</p>
        { customOption(emailState, setEmailState) }
        <p
          style={{
            'color': 'red',
            'fontWeight': 'bold',
            'opacity': (emailAuth !== 1 && emailAuth !== 'wrong') ? '0' : '100%'
          }}
        >{ verifyTest('이메일 주소', emailAuth) }</p>
        <FormSubmit />
      </form>
    </article>
  );
};

export default Register;