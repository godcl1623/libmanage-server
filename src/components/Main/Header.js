import React from 'react';
import Balloon from '../Modal/Balloon';

const Options = () => (
  <>
    <button>스토어 추가</button>
    <button>라이브러리 추가</button>
  </>
);

const Header = () => (
  <header
    id="header"
    style={{
      'display': 'flex',
      'justify-content': 'space-between',
      'align-content': 'center'
    }}
  >
    <button>옵션</button>
    <Balloon contents={<Options />}/>
    <form>
      <input type="text" placeholder="검색어를 입력하세요" />
      <button>검색</button>
      <button>검색옵션</button>
    </form>
    <button>로그인</button>
  </header>
);

export default Header;