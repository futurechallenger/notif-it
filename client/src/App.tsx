import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import { AuthButton } from './AuthButton';
import { getTeamStatus } from './services/status';
import { SourcePage } from './SourcePage';
import { UNIQUE_ID_NAME } from './util/config';

const App = () => {
  const [status, setStatus] = useState('INIT');
  const rtk = localStorage.getItem(UNIQUE_ID_NAME);

  if (!rtk) {
    setStatus('NOT_AUTHED');
    return;
  }

  useEffect(() => {
    const fetchStatus = async () => {
      const ret = await getTeamStatus(rtk);
      if (!ret) {
        setStatus('NOT_AUTHED');
        return;
      }

      setStatus('AUTHED');
    };

    fetchStatus();
  }, []);
  return (
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
              <AuthButton
                title="Auth"
                status={status}
                handleStatus={setStatus}
              />
            </Route>
          </Switch>
        </div>
      </header>
    </div>
  );
};

export default App;
