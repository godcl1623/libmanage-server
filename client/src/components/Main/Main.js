import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import Header from './Header';
import Library from './Library';
import Meta from './Meta';
import Navigation from './Navigation';

const Main = () => {
  const loginStatus = useSelector(state => state.loginStatus);
  const history = useHistory();

  if (loginStatus === '') {
    alert('로그인이 필요합니다');
    history.push('/');
  }
  return (
    <main
      id="main"
      style={{
        'width': '100%',
        'height': '100vh',
        'display': 'flex',
        'flex-direction': 'column',
        'justify-content': 'center',
        'align-content': 'center'
      }}
    >
      <Header />
      <div
        id="main-contents"
        style={{
          'width': '100%',
          'height': '100%',
          'display': 'flex',
          'justify-content': 'center',
          'align-content': 'center'
        }}
      >
        <Navigation />
        <Library />
        <Meta />
      </div>
    </main>
  );
};

export default Main;