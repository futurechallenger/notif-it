import React, { useEffect } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { AuthButton } from './AuthButton';
import { BoardsList } from './BoradsList';
import qs from 'qs';

const App = () => {
  // TODO: Team ID may from a part of a url
  useEffect(() => {
    const parsed = qs.parse(window.location.href);
    const teamId = parsed[Object.keys(parsed)[0]].replace('#/', '');
    localStorage.setItem('__teamId', teamId);
  }, []);
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
            }}
          >
            <Switch>
              <Route exact path="/">
                <AuthButton title="Auth" />
              </Route>
              <Route path="/content">
                <BoardsList />
              </Route>
            </Switch>
          </div>
        </header>
      </div>
    </Router>
  );
};

export default App;
