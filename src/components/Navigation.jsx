import React, { useState } from 'react';

const menu = value => {
  const game = <p>game</p>;
  const music = <p>music</p>;
  const series = <p>series</p>;
  const movie = <p>movie</p>;
  const displayMenu = (...params) => {
    params.map(param => (
      <>
        {param}
      </>
    ));
  }
  switch (value) {
    default:
      displayMenu(game, music, series, movie);
      break;
  }
};

const Navigation = () => {
  const [selectedMenu, setSelectedMenu] = useState('all');

  return (
    <nav id="navigation">
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