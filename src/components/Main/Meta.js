import React from 'react';

const Meta = () => (
  <section
    id="meta"
    style={{
      'flex': '2'
    }}
  >
    <article className="meta-wrapper-top">
      <h3>메타데이터 표시</h3>
      <article className="meta-wrapper-tab">
        <nav id="meta-tab">
          <button>정보</button>
          <button>사용자 입력 정보</button>
        </nav>
        <article className="meta-wrapper-contents">
          <p>텍스트</p>
        </article>
      </article>
    </article>
  </section>
);

export default Meta;