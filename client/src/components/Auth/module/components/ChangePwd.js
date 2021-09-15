/* eslint-disable no-alert */
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import InputTemplate from './InputTemplate';
import FormSubmit from './FormSubmit';
import { tokenStateCreator } from '../../../../actions';
import { encryptor } from '../../../../custom_modules/aeser';
import { tracer } from '../../../../custom_modules/security/fes';
import { hasher } from '../../../../custom_modules/hasher';
import { verifyPwd } from '../utils';

const ChangePwd = ({ token, reqTime }) => {
  const [pwdMatch, setPwdMatch] = useState(true);
  const [isValid, setIsValid] = useState(true);
  const dispatch = useDispatch();
  const history = useHistory();
  const { userId, ttl, tokenId, originTime } = token;
  const checkValidation = (pwd, pwdCheck, verifyFunc) => {
    let isReadyToSubmit;
    if (!verifyFunc(pwd) && pwd !== pwdCheck) {
      setIsValid(false);
      setPwdMatch(false);
      isReadyToSubmit = false;
    } else if (verifyFunc(pwd) && pwd !== pwdCheck) {
      setIsValid(true);
      setPwdMatch(false);
      isReadyToSubmit = false;
    } else if (!verifyFunc(pwd) && pwd === pwdCheck) {
      setIsValid(false);
      setPwdMatch(true);
      isReadyToSubmit = false;
    } else {
      setIsValid(true);
      setPwdMatch(true);
      isReadyToSubmit = true;
    }
    return isReadyToSubmit;
  };
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
        } else if (checkValidation(pwd, pwdCheck, verifyPwd)) {
          formData.id = userId;
          formData.pwd = hasher(pwd);
          formData.tokenId = tokenId;
          formData.ttl = ttl;
          formData.reqTime = reqTime();
          formData.originTime = originTime;
          axios.post('http://localhost:3002/member/reset/pwd', { formData: encryptor(formData, tracer) }, {withCredentials: true})
            .then(res => {
              if (res.data === 'complete') {
                alert('비밀번호가 변경되었습니다.\n다시 로그인해주세요.');
                history.push('/');
              } else if (res.data === 'expired') {
                dispatch(tokenStateCreator(false));
              }else {
                alert('오류가 발생했습니다.');
              }
            })
            .catch(err => alert(err));
        }
      }}
    >
      <InputTemplate
        inputType="password"
        labelText="비밀번호: "
        inputFor="PWD"
        handler={() => {
          setIsValid(true);
        }}
        placeholder='비밀번호 (8~16자 이내, 영문, 숫자, 기호(!,@,#,$,%,^,&,*) 사용)'
      />
      <p
        style={{
          'color': 'red',
          'fontWeight': 'bold',
          'opacity': isValid ? '0' : '100%'
        }}
      >※ 비밀번호 형식과 맞지 않습니다.</p>
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
      <FormSubmit />
    </form>
  );
};

export default ChangePwd;