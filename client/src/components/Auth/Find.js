import React from 'react';
import FormSubmit from './module/FormSubmit';
import InputTemplate from './module/InputTemplate';

const findRequested = mode => {
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

const Find = () => {
  const [tabState, setTabState] = React.useState('id');

  const tabHandler = str => setTabState(str);

  React.useEffect(() => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {input.value = ''});
  }, [tabState]);

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
          <form
            onSubmit={e => {
              e.preventDefault();
              console.log(e.target.ID.value, e.target.nickname.value, e.target.email.value)
            }}
          >
            { findRequested(tabState) }
            <FormSubmit />
          </form>
        </div>
      </section>
    </article>
  );
};

export default Find;