import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Balloon from '../Modal/Balloon';
import { balloonStateCreator, balloonOriginCreator } from '../../actions';

const Options = () => (
  <>
    <h3>표시방식:</h3>
    <button>리스트</button>
    <button>썸네일</button>
    <input type="range" />
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

const Library = () => {
  // const [balloonState, setBalloonState] = React.useState('none');
  const balloonState = useSelector(state => state.balloonState);
  const balloonOrigin = useSelector(state => state.balloonOrigin);
  const [ btnCoords, setBtnCoords ] = React.useState({});
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
      <Balloon contents={<Options />} display={wrapper} style={style} hand={hand} />
      <ul id="contents-lists">
        <li>라이브러리 1</li>
        <li>라이브러리 2</li>
        <li>라이브러리 3</li>
        <li>라이브러리 4</li>
        <li>라이브러리 5</li>
      </ul>
      {/* { testBtns(apiAuth, setApiAuth) } */}
    </article>
  );
};

export default Library;