import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import { AuthButton } from './AuthButton';
import { SourcePage } from './SourcePage';
import { getTeamStatus } from './services/status';
import qs from 'qs';

const App = () => {
  const [status, setStatus] = useState('INIT');
  // TODO: Team ID may from a part of a url
  useEffect(() => {
    const requestUrl = window.location.href;

    if (requestUrl.indexOf('teamId') < 0) {
      console.error('teamd id is missed');
      setStatus('NOT_AUTHED');
      return;
    }

    const parsed = qs.parse(window.location.href);
    const teamId = parsed[Object.keys(parsed)[0]].replace(/#\/\w*/g, '');
    // teamId = teamId.split('=')[1];
    localStorage.setItem('__teamId', teamId);

    const fetchStatus = async () => {
      const ret = await getTeamStatus(teamId);
      if (!ret) {
        setStatus('NOT_AUTHED');
        return;
      }

      setStatus('AUTHED');
    };

    fetchStatus();
  }, []);
  return (
    // <Router>
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
              <SourcePage status={status} />
            </Route>
            <Route path="/auth">
              <AuthButton title="Auth" status={status} />
            </Route>
          </Switch>
        </div>
      </header>
    </div>
    // </Router>
  );
};

export default App;
