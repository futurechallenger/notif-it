import React from 'react';
import { RouterButton } from './components/RouterButton';
import { useHistory } from 'react-router-dom';

interface AuthButtonProps {
  title: string;
}

const AuthButton: React.FunctionComponent<AuthButtonProps> = ({ title }) => {
  const history = useHistory();

  const onClick = () => {
    Trello.authorize({
      type: 'popup',
      name: 'Getting Started Application',
      scope: {
        read: 'true',
        write: 'true',
      },
      expiration: 'never',
      success: (v: any) => {
        console.log('===>Success', v);
        history.push('/content');
      },
      error: (e: any) => console.log('===>Err', e),
    });
  };

  return <RouterButton handleClick={onClick} title={title} />;
};

export { AuthButton };
