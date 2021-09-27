import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Main from './Main/Main';
import Login from './Auth/Login';
import Register from './Auth/Register';
import Find from './Auth/Find';
import Reset from './Auth/Reset';
import Progress from './Progress';
import FindRequested from './Auth/module/components/FindRequested';
import AddStore from './Options/AddStore';
import AddLib from './Options/AddLib';
import MetaMod from './Options/MetaMod';
import MetaModExp from './Options/MetaModExp';
import ManageStore from './Options/Store/ManageStore';
import '../styles/temp.css';

const App = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={ Login } />
      <Route path="/main" exact component={ Main } />
      <Route path="/member/register" exact component={ Register } />
      <Route
        path="/member/find"
        exact
        component={ () => <Redirect to="/member/find/id" /> }
      />
      <Route path="/member/find/id" exact component={ () => <Find mode='id' /> } />
      <Route path="/member/find/pwd" exact component={ () => <Find mode='pwd' /> } />
      <Route path="/member/reset/:token" exact component={Reset} />
      <Route path="/api/progress" exact component={ Progress } />
      <Route component={() => <Redirect to="/" />} />
    </Switch>
  </Router>
);

export default App;