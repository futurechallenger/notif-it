import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Button } from '@material-ui/core';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            console.log('Button clicked');
          }}
        >
          Primary
        </Button>
      </header>
    </div>
  );
};

export default App;
