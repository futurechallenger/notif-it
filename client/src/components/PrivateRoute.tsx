import React, { FunctionComponent } from 'react';
import { Route, Redirect } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactChildren;
  status: string;
}

const PrivateRoute: React.FunctionComponent<PrivateRouteProps> = ({
  children,
  status,
}) => {
  return (
    <Route
      render={({ location }) =>
        status === 'NOT_AUTHED' ? (
          <Redirect to={{ pathname: '/login', state: { from: location } }} />
        ) : (
          children
        )
      }
    />
  );
};

export { PrivateRoute };
