import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { selectedCategoryCreator, selectedStoresCreator } from '../../actions';

const menu = (value, storeList, dispatch, filterStores) => {
  const game = <p>game</p>;
  const music = <p>music</p>;
  const series = <p>series</p>;
  const movie = <p>movie</p>;
  const displayMenu = (...params) =>
    params.map((param, index) => {
      const eachCategoriesStores = storeList[param.props.children];
      if (eachCategoriesStores !== undefined) {
        return (
          <div key={`category ${index}`} className="category">
            <div
              key={`category-header ${index}`}
              className="category-header"
              style={{
                display: 'flex',
                height: '100%'
              }}
            >
              {param}
              <label
                htmlFor={param.props.children}
                data-value={param.props.children}
                onClick={e => {
                  dispatch(filterStores('all'));
                }}
                style={{
                  border: '1px solid black',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  background: 'red'
                }}
              >
                {' '}
              </label>
              <input
                type="radio"
                name={param.props.children}
                checked={true}
                onChange={() => {}}
                style={{
                  display: 'none'
                }}
              />
            </div>
            {eachCategoriesStores.map(store => (
              <p
                onClick={e => {
                  dispatch(filterStores(store));
                }}
              >
                - {store}
              </p>
            ))}
          </div>
        );
        // eslint-disable-next-line no-else-return
      } else {
        return (
          <div key={`category ${index}`} className="category">
            <div key={`category-header ${index}`} className="category-header">
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
  const selectedCategory = useSelector(state => state.selectedCategory);
  const dispatch = useDispatch();

  return (
    <nav
      id="navigation"
      style={{
        flex: '1'
      }}
    >
      <select
        name="content-type"
        className="dropdown"
        value={selectedCategory}
        onChange={e => dispatch(selectedCategoryCreator(e.target.value))}
      >
        <option value="all">전체</option>
        <option value="game">게임</option>
        <option value="music">음악</option>
        <option value="series">드라마</option>
        <option value="movie">영화</option>
      </select>
      {menu(selectedCategory, storesList, dispatch, selectedStoresCreator)}
      {/* <button
        onClick={e => {
          axios.post('http://localhost:3003/api/connect', {execute: 'order66'}, {withCredentials: true})
            .then(res => console.log(res))
        }}
      >
        api test
      </button> */}
    </nav>
  );
};

export default Navigation;
