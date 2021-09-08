import React from 'react';
import axios from 'axios';
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
              const inputs = Array.from(document.querySelectorAll('input'));
              const emptyInputCheck = inputs.filter(input => input.value === '');
              const formData = {};
              const infoCheck = async infoObj => {
                await axios.post(`http://localhost:3002/member/find/${tabState}`, infoObj, { withCredentials: true })
                  .then(res => alert(res.data))
                  .catch(err => alert(err));
              };
              if (emptyInputCheck.length !== 0) alert('정보를 입력해주세요.');
              if (tabState === 'id') {
                formData.nick = e.target.nickname.value;
                formData.email = e.target.email.value;
                infoCheck(formData);
              } else {
                formData.id = e.target.ID.value;
                formData.nick = e.target.nickname.value;
                formData.email = e.target.email.value;
                infoCheck(formData);
              }
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