import { Button } from '@material-ui/core';
import React from 'react';
import './App.css';
import logo from './logo.svg';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="./login"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              window.Trello.authorize({
                type: 'popup',
                name: 'Getting Started Application',
                scope: {
                  read: 'true',
                  write: 'true',
                },
                expiration: 'never',
                success: (v: any) => console.log('===>Success', v),
                error: (e: any) => console.log('===>Err', e),
              });
            }}
          >
            Primary
          </Button>
        </div>
      </header>
    </div>
  );
};

export default App;
