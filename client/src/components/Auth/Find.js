import React from 'react';
import FormSubmit from './module/FormSubmit';

const FindRequested = mode => {
  if (mode === 'pwd') {
    return (
      <>
        <label>가입한 아이디: </label>
        <input name="ID" />
        <label>가입한 별명: </label>
        <input name="nickname" />
        <label>가입한 이메일 주소: </label>
        <input />
      </>
    );
  } 
  return (
    <>
      <label htmlFor="nickname">가입한 별명: </label>
      <input name="nickname" />
      <label htmlFor="email">가입한 이메일 주소: </label>
      <input name="email" />
    </>
  );
}

const Find = () => {
  const [tabState, setTabState] = React.useState('id');

  const tabHandler = str => setTabState(str);

  return (
    <article
      id="find"
    >
      <section
        className="contents-wrapper"
      >
        <div className="tab-wrapper">
          <button name="id" onClick={e => {
            e.preventDefault();
            tabHandler('id');
            }}>아이디 찾기</button>
          <button name="pwd" onClick={e => {
            e.preventDefault();
            tabHandler('pwd');
            }}>비밀번호 찾기</button>
        </div>
        <div className="form-wrapper">
          <form>
            <FormSubmit />
          </form>
        </div>
      </section>
    </article>
  );
};

export default Find;