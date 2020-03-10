import React from 'react';
import { RouterButton } from './components/RouterButton';
import { useHistory } from 'react-router-dom';
import { host, authUrl, UNIQUE_ID_NAME } from './util/config';
import Axios from 'axios';
import { Route, Redirect } from 'react-router-dom';
import qs from 'qs';

interface AuthButtonProps {
  title: string;
  status: string;
  handleStatus: (s: string) => void;
}

const AuthButton: React.FunctionComponent<AuthButtonProps> = ({
  title,
  status,
  handleStatus,
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
        // TODO: get team id, service from location.href
        const url = window.location.href;
        if (url.indexOf('?') <= 0) {
          console.error('===>Can not get teamId and appType');
          return;
        }

        const queryString = url.split('?')[1].replace(/#\/\w*/g, '');
        const parsed = qs.parse(queryString);

        const { teamId, apptype } = parsed;
        const ret = await Axios.post(`${host}/callback`, {
          t: param,
          teamId,
          sn: apptype,
        });
        console.log('token', ret);
        if (!ret || ret.status !== 200) {
          // TODO: notify users there're something wrong with the auth
          console.error('no token returned');
          return;
        }

        localStorage.setItem(UNIQUE_ID_NAME, ret.data.rtk);
        handleStatus('AUTHED');
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
