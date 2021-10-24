/* eslint-disable no-else-return */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Balloon from '../Modal/Balloon';
import {
  balloonStateCreator,
  balloonOriginCreator,
  libDisplayStateCreator,
  extCredStateCreator,
  selectedItemCreator,
  selectedItemDataCreator,
  modalOriginCreator
} from '../../actions';

const Options = ({ dispatch, changeState, coverSize, setCoverSize }) => (
  <>
    <h3>표시방식:</h3>
    <button
      onClick={e => {
        e.preventDefault();
        dispatch(changeState('list'));
      }}
    >리스트</button>
    <button
      onClick={e => {
        e.preventDefault();
        dispatch(changeState('cover'));
      }}
    >썸네일</button>
    <input
      type="range"
      id="cover_size"
      name="cover_size"
      min="5"
      max="15"
      value={coverSize}
      onChange={e => {
        setCoverSize(Number(e.target.value));
      }}
    />
    <p>{coverSize}</p>
  </>
);

const testBtns = (state, setState) => (
  <>
    <button
        onClick={e => {
          axios.post('http://localhost:3003/api/connect', {execute: 'order66'}, {withCredentials: true})
            .then(res => {
              setState(res.data)
            })
        }}
      >
        api 인증
      </button>
      <button
        onClick={e => {
          axios.post('http://localhost:3003/meta_search', {apiCred: state}, {withCredentials: true})
            .then(res => console.log(res))
        }}
      >
        검색 테스트
      </button>
  </>
);

const makeList = (...args) => {
  const [
    source,
    displayState,
    size,
    selectedCategory,
    selectedStore,
    userState,
    extCredState,
    dispatch,
    setExtCred,
    selectItem,
    selItemData
  ] = args;
  if (source !== '') {
    if (selectedCategory === 'all' || selectedCategory === 'game') {
      if (selectedStore.includes('all') || selectedStore.includes('steam')) {
        const { steam } = source;
        if (displayState === 'list') {
          const result = steam.map((item, index) => (
            <li
              key={index}
              onClick={e => {
                dispatch(modalOriginCreator('Library'));
                selectItem(e.target.innerText);
                if (extCredState.cid === undefined) {
                  axios.post('http://localhost:3003/api/connect', {execute: 'order66'}, {withCredentials: true})
                    .then(res => {
                      dispatch(setExtCred(res.data));
                      const reqData = {
                        reqUser: userState.nickname,
                        selTitle: item.title,
                        credData: res.data
                      };
                      axios.post('http://localhost:3003/get/meta', {reqData}, {withCredentials: true})
                        .then(res => {
                          selItemData(res.data);
                        })
                    });
                } else {
                  const reqData = {
                    reqUser: userState.nickname,
                    selTitle: item.title,
                    credData: extCredState
                  };
                  axios.post('http://localhost:3003/get/meta', {reqData}, {withCredentials: true})
                    .then(res => {
                      selItemData(res.data);
                    })
                }
              }}
            >
              {item.title}
            </li>
          ));
          return result;
        } else if (displayState === 'cover') {
          const result = steam.map((item, index) => (
            <li
              key={`img-${index}`}
              style={{
                'margin': '10px',
                'height': `${size}vw`,
                'flex': '0 0 10%',
                'display': 'flex',
                'justifyContent': 'center',
                'alignItems': 'center'
              }}
            >
              <img
                src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${item.cover}.png`}
                title={`${item.title}`}
                alt={`${item.title}-cover`}
                style={{
                  'height': '100%'
                }}
                onClick={e => {
                  selectItem(e.target.title);
                  if (extCredState.cid === undefined) {
                    axios.post('http://localhost:3003/api/connect', {execute: 'order66'}, {withCredentials: true})
                      .then(res => {
                        dispatch(setExtCred(res.data));
                        const reqData = {
                          reqUser: userState.nickname,
                          selTitle: item.title,
                          credData: res.data
                        };
                        axios.post('http://localhost:3003/get/meta', {reqData}, {withCredentials: true})
                          .then(res => {
                            selItemData(res.data);
                          })
                      });
                  } else {
                    const reqData = {
                      reqUser: userState.nickname,
                      selTitle: item.title,
                      credData: extCredState
                    };
                    axios.post('http://localhost:3003/get/meta', {reqData}, {withCredentials: true})
                      .then(res => {
                        selItemData(res.data);
                      })
                  }
                }}
              />
            </li>
          ));
          return result;
        }
      }
    }
  }
}

const Library = ({ userLib }) => {
  // const [balloonState, setBalloonState] = React.useState('none');
  const balloonState = useSelector(state => state.balloonState);
  const balloonOrigin = useSelector(state => state.balloonOrigin);
  const libDisplay = useSelector(state => state.libDisplay);
  const selectedCategory = useSelector(state => state.selectedCategory);
  const selectedStores = useSelector(state => state.selectedStores);
  const userState = useSelector(state => state.userState);
  const extCredState = useSelector(state => state.extCredState);
  const [ btnCoords, setBtnCoords ] = React.useState({});
  const [coverSize, setCoverSize] = React.useState(10);
  const [localSelectedItem, setLocalSelectedItem] = React.useState('');
  const [localSelectedItemData, setLocalSelectedItemData] = React.useState({});
  // const [apiAuth, setApiAuth] = React.useState('');
  const dispatch = useDispatch();
  const ref = React.useRef();
  const updateBtnCoords = (left, top) => {
    setBtnCoords(prevState => ({
      ...prevState,
      leftCoord: left,
      topCoord: top
    }));
  };

  React.useEffect(() => {
    const { left, top } = ref.current.getBoundingClientRect();
    updateBtnCoords(left, top);
  }, []);

  React.useEffect(() => {
    dispatch(selectedItemCreator(localSelectedItem));
    dispatch(selectedItemDataCreator(localSelectedItemData));
  }, [localSelectedItem, localSelectedItemData])

  const wrapper = {
    'display': balloonOrigin === 'Library' ? balloonState : 'none',
    'position': 'absolute',
    'top': '0',
    'right': '0',
    // 'background': 'rgba(0, 0, 0, 0.3)',
    'width': '100%',
    'height': '100%',
    'zIndex': '1'
  }

  const style = {
    'padding': '20px',
    'display': balloonOrigin === 'Library' ? balloonState : 'none',
    'justifyContent': 'center',
    'alignItems': 'center',
    'width': '300px',
    'height': '100px',
    'position': 'absolute',
    'top': `calc(${btnCoords.topCoord}px + 50px)`,
    'left': `calc(${btnCoords.leftCoord}px + 50px)`,
    'background': 'white',
    'zIndex': '1'
  };

  const hand = {
    'width': '50px',
    'height': '50px',
    'position': 'absolute',
    'top': `calc(${btnCoords.topCoord}px + 25px)`,
    'left': `calc(${btnCoords.leftCoord}px + 50px)`,
    // 'transform': 'translate(-100%, -50%)',
    'background': 'white',
    'display': balloonOrigin === 'Library' ? balloonState : 'none'
  }

  return (
    <article
      id="library"
      style={{
        'flex': '2',
        'overflowY': 'scroll',
        'overflowX': 'hidden'
        // 'position': 'relative'
      }}
    >
      <button
        className="option"
        onClick={() => {
          dispatch(balloonOriginCreator('Library'));
          if (balloonState === 'none') {
            dispatch(balloonStateCreator('flex'));
          } else if (balloonOrigin === 'Library') {
            dispatch(balloonStateCreator('none'));
          }
        }}
        ref={ref}
      >옵션</button>
      <Balloon
        contents={
          <Options
            dispatch={dispatch}
            changeState={libDisplayStateCreator}
            coverSize={coverSize}
            setCoverSize={setCoverSize}
          />
        }
        display={wrapper}
        style={style}
        hand={hand}
      />
      <ul
        id="contents-lists"
        style={{
          'display': `${libDisplay === 'cover' ? 'flex' : 'inline-block'}`,
          'width': '100%',
          'flexWrap': 'wrap'
        }}
      >
        {
          makeList(
            userLib,
            libDisplay,
            coverSize,
            selectedCategory,
            selectedStores,
            userState,
            extCredState,
            dispatch,
            extCredStateCreator,
            setLocalSelectedItem,
            setLocalSelectedItemData
          )
        }
      </ul>
      {/* { testBtns(apiAuth, setApiAuth) } */}
    </article>
  );
};

export default Library;