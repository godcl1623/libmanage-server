import React from 'react';

const MetaMod = () => (
  <article
    id="metamod"
    style={{
      'width': '100%',
      'height': '100%'
    }}
  >
    <section
      className="header-metamod"
      style={{
        'display': 'flex',
        'width': '100%'
      }}
    >
      <div
        className="container-img"
        style={{
          'width': '50px',
          'height': '50px'
        }}
      ></div>
      <div
        className="container-heading"
        style={{
          'width': '100%'
        }}
      >
        <h3>Title</h3>
        <p>Category</p>
      </div>
    </section>
    <section className="wrapper-contents">
      <section className="wrapper-tab">
        <button>정보</button>
        <button>미디어</button>
      </section>
      <form
        onSubmit={e => {
          e.preventDefault();
          alert('submitted')
        }}
      >
        <div className="wrapper-item">
          <div className="item">
            <label for="title">제목</label>
            <input type="text" name="title" />
          </div>
          <div className="item">
            <label for="genre">장르</label>
            <input type="text" name="genre" />
          </div>
          <div className="item">
            <label for="developer">개발사</label>
            <input type="text" name="developer" />
          </div>
          <div className="item">
            <label for="distributor">배급사</label>
            <input type="text" name="distributor" />
          </div>
          <div className="item">
            <label for="release">출시일</label>
            <input type="text" name="release" />
          </div>
        </div>
        <div
          className="wrapper-btn"
          style={{
            'display': 'flex',
            'justify-content': 'flex-end'
          }}
        >
          <button type="submit">취소</button>
          <button type="submit">확인</button>
        </div>
      </form>
    </section>
  </article>
);

export default MetaMod;