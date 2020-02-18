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
              Trello.authorize({
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
            Auth
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={async () => {
              const { username } = await Trello.members.get('me');
              const boards = await Trello.members.get(`${username}/boards`, {
                filter: 'open',
                fields: 'id,name,desc',
              });
              console.log('===>All Boards', boards);
              // https://hooks.glip.com/webhook/3019f897-2ec4-444b-84e5-8875be4ee024
            }}
          >
            List all
          </Button>
        </div>
      </header>
    </div>
  );
};

export default App;
