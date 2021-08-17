import React from 'react';

const AddStore = () => (
  <article
    id="store_add"
    style={{
      'display': 'flex',
      'flex-direction': 'column',
      'justify-content': 'center',
      'align-items': 'center'
    }}
  >
    <section
      id="store_search"
      style={{
        'width': '100%',
        'display': 'flex',
        'justify-content': 'center'
      }}
    >
      <form
        style={{
          'width': '80%',
          'display': 'flex',
          'justify-content': 'space-around'
        }}
      >
        <select className="category">
          <option value="">분류</option>
          <option value="game">게임</option>
          <option value="music">음악</option>
          <option value="series">드라마</option>
          <option value="movie">영화</option>
        </select>
        <select className="stores">
          <option value="">----------</option>
        </select>
        <button type="submit">추가</button>
      </form>
    </section>
    <section
      id="category-game"
      style={{
        'width': '80%',
        'display': 'flex',
        'flex-direction': 'column'
      }}
    >
      <section className="container-heading">
        <h2>게임</h2>
        <hr />
      </section>
      <section
        className="container-item"
        style={{
          'display': 'flex'
        }}
      >
        <p
          style={{
            'width': '100%'
          }}
        >item</p>
        <button>관리</button>
      </section>
    </section>
    <section
      id="category-music"
      style={{
        'width': '80%',
        'display': 'flex',
        'flex-direction': 'column'
      }}
    >
      <section className="container-heading">
        <h2>음악</h2>
        <hr />
      </section>
      <section
        className="container-item"
        style={{
          'display': 'flex'
        }}
      >
        <p
          style={{
            'width': '100%'
          }}
        >item</p>
        <button>관리</button>
      </section>
    </section>
    <section
      id="category-series"
      style={{
        'width': '80%',
        'display': 'flex',
        'flex-direction': 'column'
      }}
    >
      <section className="container-heading">
        <h2>드라마</h2>
        <hr />
      </section>
      <section
        className="container-item"
        style={{
          'display': 'flex'
        }}
      >
        <p
          style={{
            'width': '100%'
          }}
        >item</p>
        <button>관리</button>
      </section>
    </section>
    <section
      id="category-movie"
      style={{
        'width': '80%',
        'display': 'flex',
        'flex-direction': 'column'
      }}
    >
      <section className="container-heading">
        <h2>영화</h2>
        <hr />
      </section>
      <section
        className="container-item"
        style={{
          'display': 'flex'
        }}
      >
        <p
          style={{
            'width': '100%'
          }}
        >item</p>
        <button>관리</button>
      </section>
    </section>
  </article>
);

export default AddStore;