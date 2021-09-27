import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

const Library = () => {
  // const [balloonState, setBalloonState] = React.useState('none');
  const balloonState = useSelector(state => state.balloonState);
  const balloonOrigin = useSelector(state => state.balloonOrigin);
  const dispatch = useDispatch();

  const wrapper = {
    'display': balloonOrigin === 'Library' ? balloonState : 'none',
    'position': 'absolute',
    'top': '0',
    'right': '0',
    'background': 'rgba(0, 0, 0, 0.3)',
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
    'top': '50px',
    // 'right': '0',
    // 버튼 좌표 따서 말풍선 좌표로 설정
    'left': '402px',
    'background': 'white'
  };

  const hand = {
    'width': '50px',
    'height': '50px',
    'position': 'absolute',
    'top': '0',
    'left': '0',
    'transform': 'translate(-100%, -50%)',
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
        onClick={() => {
          dispatch(balloonOriginCreator('Library'));
          if (balloonState === 'none') {
            dispatch(balloonStateCreator('flex'));
          } else if (balloonOrigin === 'Library') {
            dispatch(balloonStateCreator('none'));
          }
        }}
      >옵션</button>
      <Balloon contents={<Options />} display={wrapper} style={style} hand={hand} />
      <ul id="contents-lists">
        <li>라이브러리 1</li>
        <li>라이브러리 2</li>
        <li>라이브러리 3</li>
        <li>라이브러리 4</li>
        <li>라이브러리 5</li>
      </ul>
      <a
        href="http://localhost:3003/auth/steam"
      >스팀으로 로그인</a>
    </article>
  );
};

export default Library;