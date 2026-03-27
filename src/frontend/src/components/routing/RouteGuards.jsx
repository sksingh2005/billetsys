import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import StatusPage from '../../pages/StatusPage';
import { PATHS } from '../../routes/paths';

function GuardLoading() {
  return (
    <section className="panel">
      <LoadingSpinner label="Loading session..." />
    </section>
  );
}

export function RequireAuth({ sessionState, children }) {
  const location = useLocation();

  if (sessionState.loading) {
    return <GuardLoading />;
  }

  if (!sessionState.data?.authenticated) {
    return <Navigate replace to={PATHS.login} state={{ from: location }} />;
  }

  return children;
}

export function RequireRole({ sessionState, allowedRoles, children }) {
  if (sessionState.loading) {
    return <GuardLoading />;
  }

  if (!sessionState.data?.authenticated) {
    return <Navigate replace to={PATHS.login} />;
  }

  if (!allowedRoles.includes(sessionState.data?.role)) {
    return (
      <StatusPage
        sessionState={sessionState}
        title="Access denied"
        message="You do not have permission to view this route in the React shell."
      />
    );
  }

  return children;
}
