import React from 'react';
import { Button } from '@material-ui/core';

interface RouterButtonProps {
  title: string;
  handleClick: () => void;
}

const RouterButton: React.FunctionComponent<RouterButtonProps> = ({
  handleClick,
  title,
}) => {
  return (
    <Button variant="contained" color="primary" onClick={handleClick}>
      {title}
    </Button>
  );
};

export { RouterButton };
