import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Main from './Main/Main';
import Login from './Auth/Login';
import Register from './Auth/Register';
import AddStore from './Options/AddStore';
import AddLib from './Options/AddLib';
import MetaMod from './Options/MetaMod';
import MetaModExp from './Options/MetaModExp';
import ManageStore from './Options/Store/ManageStore';
import '../styles/temp.css';

const App = () => (
  <Router>
    <Switch>
      <Route path="/" exact>
        <Login />
      </Route>
      <Route path="/main" exact>
        <Main />
      </Route>
    </Switch>
  </Router>
);

export default App;