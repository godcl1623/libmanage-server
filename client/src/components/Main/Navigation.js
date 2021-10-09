import React, { useState } from 'react';

const menu = (value, storeList, dispatch, changeCategory, changeStores) => {
  const game = <p>game</p>;
  const music = <p>music</p>;
  const series = <p>series</p>;
  const movie = <p>movie</p>;
  const displayMenu = (...params) => params.map((param, index) => {
    const eachCategoriesStores = storeList[param.props.children];
    if (eachCategoriesStores !== undefined) {
      return (
        <div key={`category ${index}`} className='category'>
          <div key={`category-header ${index}`} className='category-header'>
            {param}
            {/* <label
              htmlFor={param.props.children}
              onClick={e => {
                console.log(e.target.value)
              }}
              style={{
                'border': '1px solid black',
                'width': '100%',
                'height': '100%',
                'background': 'red'
              }}
            ></label> */}
            <input
              type='radio'
              value={param.props.children}
              name={param.props.children}
              style={{
                'display': 'block'
              }}
              onClick={e => {
                console.log(e.target.name)
              }}
            />
          </div>
          { eachCategoriesStores.map(store => <p>- {store}</p>)}
        </div>
      )
    // eslint-disable-next-line no-else-return
    } else {
      return (
        <div key={`category ${index}`} className='category'>
          <div key={`category-header ${index}`} className='category-header'>
            {param}
          </div>
        </div>
      );
    }
  });
  switch (value) {
    case 'game':
      return displayMenu(game);
    case 'music':
      return displayMenu(music);
    case 'series':
      return displayMenu(series);
    case 'movie':
      return displayMenu(movie);
    default:
      return displayMenu(game, music, series, movie);
  }
};

const Navigation = ({ storesList }) => {
  const [selectedMenu, setSelectedMenu] = useState('all');

  return (
    <nav
      id="navigation"
      style={{
        'flex': '1'
      }}
    >
      <select
        name="content-type"
        className="dropdown"
        value={selectedMenu}
        onChange={e => setSelectedMenu(e.target.value)}
      >
        <option value="all">전체</option>
        <option value="game">게임</option>
        <option value="music">음악</option>
        <option value="series">드라마</option>
        <option value="movie">영화</option>
      </select>
      {menu(selectedMenu, storesList)}
    </nav>
  );
};

export default Navigation;