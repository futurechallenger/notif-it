import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { BoardList } from './BoardList';

interface SourcePageProps {
  status: string;
}

const SourcePage = ({ status }: SourcePageProps) => {
  // const [status, setStatus] = useState<string>('INIT');
  // // TODO: Team ID may from a part of a url
  // useEffect(() => {
  //   const requestUrl = window.location.href;

  //   if (requestUrl.indexOf('teamId') < 0) {
  //     console.error('teamd id is missed');
  //     setStatus('NOT_AUTHED');
  //     return;
  //   }

  //   const parsed = qs.parse(window.location.href);
  //   const teamId = parsed[Object.keys(parsed)[0]].replace(/#\/\w*/g, '');
  //   // teamId = teamId.split('=')[1];
  //   localStorage.setItem('__teamId', teamId);

  //   const fetchStatus = async () => {
  //     const ret = await getTeamStatus(teamId);
  //     if (!ret) {
  //       setStatus('NOT_AUTHED');
  //       return;
  //     }

  //     setStatus('AUTHED');
  //   };

  //   fetchStatus();
  // }, []);

  return (
    <Route
      render={({ location }) => {
        return status === 'AUTHED' ? (
          <BoardList />
        ) : (
          <Redirect to={{ pathname: '/auth', state: { from: location } }} />
        );
      }}
    />
  );
};

export { SourcePage };
