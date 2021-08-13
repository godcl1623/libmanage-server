import React from 'react';
import Header from './Header';
import Library from './Library';
import Meta from './Meta';
import Navigation from './Navigation';

const Main = () => (
  <section id="Main">
    <h1>Main</h1>
    <Header />
    <Navigation />
    <Library />
    <Meta />
  </section>
);

export default Main;