import { Button } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { AuthButton } from './AuthButton';
import { BoardsList } from './BoradsList';
import { RouterButton } from './components/RouterButton';

const App = () => {
  const [windowState, setWindowState] = useState('closed');
  // useEffect(() => {}, [windowState]);
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
