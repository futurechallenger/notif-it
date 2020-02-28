import { Button } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { AuthButton } from './AuthButton';
import { BoardsList } from './BoradsList';
import { RouterButton } from './components/RouterButton';

const App = () => {
  const [windowState, setWindowState] = useState('closed');
  useEffect(() => {
    if (windowState === 'closed') {
      const w = window.open('url', 'auth', 'wi');
    }
  }, [windowState]);
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
                <>
                  <AuthButton title="Auth" />
                  <RouterButton title="Auth by Server" handleClick={() => {}} />
                </>
              </Route>
              <Route path="/content">
                {/* <Button
                  variant="contained"
                  color="secondary"
                  onClick={async () => {
                    const { username } = await Trello.members.get('me');
                    const boards = await Trello.members.get(
                      `${username}/boards`,
                      {
                        filter: 'open',
                        fields: 'id,name,desc',
                      },
                    );
                    console.log('===>All Boards', boards);
                    // https://hooks.glip.com/webhook/3019f897-2ec4-444b-84e5-8875be4ee024
                  }}
                >
                  List all
                </Button> */}
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
