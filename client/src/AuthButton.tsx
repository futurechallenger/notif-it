import React from 'react';
import { RouterButton } from './components/RouterButton';
import { useHistory } from 'react-router-dom';
import { host, authUrl } from './util/config';
import Axios from 'axios';

interface AuthButtonProps {
  title: string;
}

const AuthButton: React.FunctionComponent<AuthButtonProps> = ({ title }) => {
  const history = useHistory();

  const w = window as any;
  if (!w.callback) {
    const callback = async (param: string) => {
      if (!param) {
        console.error('ERROR: param is invalid!');
        return;
      }

      try {
        const ret = await Axios.post(`${host}/callback`, { t: param });
        console.log('token', ret);
        history.replace('/content');
      } catch (e) {
        console.error('error', e);
      }
    };

    w.callback = callback;
  }

  const onClick = () => {
    window.open(authUrl);
  };

  return <RouterButton handleClick={onClick} title={title} />;
};

export { AuthButton };
