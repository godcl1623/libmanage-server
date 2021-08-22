import React from 'react';
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
      <button>로그인</button>
    </header>
  );
};

export default Header;