import React from 'react';
import axios from 'axios';
import Balloon from '../Modal/Balloon';

const Options = () => (
  <>
    <h3>표시방식:</h3>
    <button>리스트</button>
    <button>썸네일</button>
    <input type="range" />
  </>
);

const Library = () => {
  const [balloonState, setBalloonState] = React.useState('none');
  const [apiData, setApiData] = React.useState('');

  const handler = (name, value) => {
    setApiData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  React.useEffect(() => {console.log(apiData)}, [apiData])

  React.useEffect(() => {
    axios.get('http://localhost:3003/test', { withCredentials: true })
      .then(res => console.log(res));
  }, []);

  const wrapper = {
    'display': balloonState,
    'position': 'absolute',
    'top': '50px',
    'right': '0'
  }

  const style = {
    'padding': '20px',
    'display': balloonState,
    'justifyContent': 'center',
    'alignItems': 'center',
    'width': '300px',
    'height': '100px',
    'position': 'absolute',
    'top': '0',
    'right': '0',
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
    'display': balloonState
  }

  return (
    <article
      id="library"
      style={{
        'flex': '2',
        'position': 'relative'
      }}
    >
      <button
        onClick={() => {
          if (balloonState === 'none') {
            setBalloonState('flex');
          } else {
            setBalloonState('none');
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
      {/* <button
        onClick={e => {
          e.preventDefault();
          axios.get('http://localhost:3003/auth/steam/return', { withCredentials: true })
            .then(res => console.log(res.data));
        }}
      >스팀으로 로그인</button> */}
      <a
        href="http://localhost:3003/auth/steam"
      >스팀으로 로그인</a>
      <button
        onClick={e => {
          e.preventDefault();
          axios.post('http://localhost:3003/api_test', { execute: 'order66' }, { withCredentials: true})
            .then(res => {
              // console.log(res.data)
              handler('token', res.data.access_token);
              handler('cid', res.data.cid);
            });
        }}
      >api test</button>
      <button
        onClick={e => {
          e.preventDefault();
          axios.post('http://localhost:3010/db_test', {
            cid: apiData.cid,
            token: apiData.token
          }, { withCredentials: true })
            .then(res => console.log(res))
        }}
      >db test</button>
    </article>
  );
};

export default Library;