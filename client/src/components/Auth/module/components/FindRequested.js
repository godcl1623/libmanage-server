import React from 'react';
import InputTemplate from './InputTemplate';

const FindRequested = ({ mode }) => {
  if (mode === 'pwd') {
    return (
      <>
        <InputTemplate inputType="text" labelText="가입한 아이디: " inputFor="ID" />
        <InputTemplate inputType="text" labelText="가입한 별명: " inputFor="nickname" />
        <InputTemplate inputType="text" labelText="가입한 이메일 주소: " inputFor="email" />
      </>
    );
  } 
  return (
    <>
      <InputTemplate inputType="text" labelText="가입한 별명: " inputFor="nickname" />
      <InputTemplate inputType="text" labelText="가입한 이메일 주소: " inputFor="email" />
    </>
  );
}

export default FindRequested;