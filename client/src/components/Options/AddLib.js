import React from 'react';

const AddLib = () => (
  <article
    id="library_add"
    style={{
      'display': 'flex',
      'flex-direction': 'column',
      'justify-content': 'center',
      'align-items': 'center',
      'width': '100%'
    }}
  >
    <div
      className="wrapper"
      style={{
        'width': '60%'
      }}
    >
      <section
        id="library_search"
        style={{
          'display': 'flex',
          'justify-content': 'center',
          'width': '100%'
        }}
      >
        <form
          style={{
            'display': 'flex',
            'justify-content': 'space-around',
            'width': '100%'
          }}
        >
          <select className="category">
            <option value="">분류</option>
            <option value="game">게임</option>
            <option value="music">음악</option>
            <option value="series">드라마</option>
            <option value="movie">영화</option>
          </select>
          <div className="container-search">
            <input type="text" className="search-term" name="search-term" />
            <button type="submit">검색</button>
          </div>
        </form>
      </section>
      <section id="library_search_result">
        <div
          className="search-item"
          style={{
            'display': 'flex'
          }}
        >
          <p
            className="item-name"
            style={{
              'width': '100%'
            }}
          >item</p>
          <button className="edit">편집</button>
          <button className="register">등록</button>
        </div>
      </section>
    </div>
  </article>
);

export default AddLib;