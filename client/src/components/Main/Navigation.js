import React, { useState } from 'react';

const menu = value => {
  const game = <p>game</p>;
  const music = <p>music</p>;
  const series = <p>series</p>;
  const movie = <p>movie</p>;
  const displayMenu = (...params) => params.map(param => (
      <div>
        {param}
      </div>
    ))
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

const Navigation = () => {
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
      {menu(selectedMenu)}
    </nav>
  );
};

export default Navigation;