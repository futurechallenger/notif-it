import React from 'react';
import { RouterButton } from './components/RouterButton';
import { useHistory } from 'react-router-dom';
import { host, authUrl } from './util/config';
import Axios from 'axios';
import { Route, Redirect } from 'react-router-dom';

interface AuthButtonProps {
  title: string;
  status: string;
}

const AuthButton: React.FunctionComponent<AuthButtonProps> = ({
  title,
  status,
}) => {
  const history = useHistory();

  const w = window as any;
  if (!w.callback) {
    const callback = async (param: string) => {
      if (!param) {
        console.error('ERROR: param is invalid!');
        return;
      }

      try {
        const teamId = localStorage.getItem('__teamId');
        const ret = await Axios.post(`${host}/callback`, { t: param, teamId });
        console.log('token', ret);
        history.replace('/');
      } catch (e) {
        console.error('error', e);
      }
    };

    w.callback = callback;
  }

  const onClick = () => {
    window.open(authUrl);
  };

  return (
    <Route
      render={({ location }) =>
        status !== 'AUTHED' ? (
          <RouterButton handleClick={onClick} title={title} />
        ) : (
          <Redirect to={{ pathname: '/', state: { from: location } }} />
        )
      }
    />
  );
};

export { AuthButton };
