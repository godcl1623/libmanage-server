import React from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Balloon from '../Modal/Balloon';

const Options = () => (
  <>
    <button
      style={{
        'width': '80%',
        'height': '50%'
      }}
    >스토어 추가</button>
    <button
      style={{
        'width': '80%',
        'height': '50%'
      }}
    >라이브러리 추가</button>
  </>
);


const Header = () => {
  const [balloonState, setBalloonState] = React.useState('none');
  const [cookieId, setCookieId] = React.useState('');
  const history = useHistory();
  
  React.useEffect(() => {
    const { cookie } = document;
    const temp = {};
    const rawcookie = cookie.split('; ');
    const foo = rawcookie.map(cook => cook.split('='));
    foo.forEach(doh => {
      // eslint-disable-next-line prefer-destructuring
      temp[doh[0]] = doh[1];
    })
    setCookieId(temp.id);
  }, []);

  const memberStatus = (
    cookieId !== ''
      ?
        <button
          onClick={() => {
            axios.post('http://localhost:3002/logout_process', {message: 'foo'}, { withCredentials: true })
              .then(res => {
                setCookieId('');
                setTimeout(() => {
                  alert(res.data);
                  history.push('/');
                }, 1);
              })
              .catch(err => alert(err));
          }}
        >
          로그아웃
        </button>
      :
        <button
          onClick={() => {
            history.push('/');
          }}
        >
          로그인
        </button>
  );
  
  const wrapper = {
    'display': balloonState,
    'position': 'absolute',
    'top': '0',
    'left': '100px'
  }

  const style = {
    'padding': '20px',
    'display': balloonState,
    'flex-direction': 'column',
    'justify-content': 'center',
    'align-items': 'center',
    'width': '300px',
    'height': '100px',
    'position': 'absolute',
    'top': '0',
    'left': '100px',
    'background': 'white'
  };

  const hand = {
    'width': '50px',
    'height': '50px',
    'position': 'absolute',
    'top': '0',
    'left': '100px',
    'transform': 'translate(-50%)',
    'background': 'white',
    'display': balloonState
  }

  return (
    <header
      id="header"
      style={{
        'display': 'flex',
        'justify-content': 'space-between',
        'align-content': 'center'
      }}
    >
      <button
        onClick={() => {
          if (balloonState === 'none') {
            setBalloonState('flex');
          } else {
            setBalloonState('none');
          }
        }}
      >옵션</button>
      <Balloon contents={<Options />} display={wrapper} style={style} hand={hand} />
      <form>
        <input type="text" placeholder="검색어를 입력하세요" />
        <button>검색</button>
        <button>검색옵션</button>
      </form>
      {/* <button>로그인</button> */}
      { memberStatus }
    </header>
  );
};

export default Header;