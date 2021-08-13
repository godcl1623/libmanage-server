import React from 'react';
import Balloon from './Balloon';

const Options = () => (
  <>
    <h3>표시방식:</h3>
    <button>리스트</button>
    <button>썸네일</button>
    <input type="range" />
  </>
);

const Library = () => (
  <section className="library">
    <button>옵션</button>
    <Balloon contents={<Options />} />
    <ul id="contents-lists">
      <li>라이브러리 1</li>
      <li>라이브러리 2</li>
      <li>라이브러리 3</li>
      <li>라이브러리 4</li>
      <li>라이브러리 5</li>
    </ul>
  </section>
);

export default Library;