import React from 'react';
import Header from './Header';
import Library from './Library';
import Meta from './Meta';
import Navigation from './Navigation';

const Main = () => (
  <section
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
  </section>
);

export default Main;