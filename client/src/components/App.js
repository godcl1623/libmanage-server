import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Main from './Main/Main';
import Login from './Auth/Login';
import Register from './Auth/Register';
import Find from './Auth/Find';
import FindRequested from './Auth/module/FindRequested';
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
      <Route path="/member/register" exact>
        <Register />
      </Route>
      <Route path="/member/find" exact>
        <Redirect to="/member/find/id" />
      </Route>
      <Route path="/member/find/id" exact>
        <Find mode='id' />
      </Route>
      <Route path="/member/find/pwd" exact>
        <Find mode='pwd' />
      </Route>
    </Switch>
  </Router>
);

export default App;