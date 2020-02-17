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
        <Button variant="contained" color="primary">
          Primary
        </Button>
      </header>
    </div>
  );
};

export default App;
