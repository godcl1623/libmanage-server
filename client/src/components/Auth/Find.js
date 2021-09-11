import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import FormSubmit from './module/components/FormSubmit';
import FindRequested from './module/components/FindRequested';
import { encryptor } from '../../custom_modules/aeser';
import { tracer } from '../../custom_modules/security/fes';

const Find = ({ mode }) => {
  const [tabState, setTabState] = React.useState(mode);

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
          <Link to="/member/find/id" onClick={() => tabHandler('id')}>아이디 찾기</Link>
          <Link to="/member/find/pwd" onClick={() => tabHandler('pwd')}>비밀번호 찾기</Link>
        </div>
        <div className="form-wrapper">
          <form
            onSubmit={e => {
              e.preventDefault();
              const inputs = Array.from(document.querySelectorAll('input'));
              const emptyInputCheck = inputs.filter(input => input.value === '');
              const formData = {};
              const infoCheck = async infoObj => {
                await axios.post(`http://localhost:3002/member/find/${tabState}`, { infoObj: encryptor(infoObj, tracer) }, { withCredentials: true })
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
            <FindRequested mode={mode} />
            <FormSubmit />
          </form>
        </div>
      </section>
    </article>
  );
};

export default Find;