import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoadingSpinner from './components/common/LoadingSpinner';
import RouteErrorBoundary from './components/routing/RouteErrorBoundary';
import { RequireAuth, RequireRole } from './components/routing/RouteGuards';
import StatusPage from './pages/StatusPage';
import { getContentRoutes } from './routes/ContentRoutes';
import { getCoreRoutes } from './routes/CoreRoutes';
import { getDirectoryRoutes } from './routes/DirectoryRoutes';
import { getMessagingRoutes } from './routes/MessagingRoutes';
import { getTicketRoutes } from './routes/TicketRoutes';

function RouteFallback() {
  return (
    <section className="panel">
      <LoadingSpinner label="Loading page..." />
    </section>
  );
}

function wrapLazyElement(element) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<RouteFallback />}>{element}</Suspense>
    </RouteErrorBoundary>
  );
}

function wrapRouteElement(route, sessionState) {
  let element = wrapLazyElement(route.element);

  if (route.requiresAuth) {
    element = <RequireAuth sessionState={sessionState}>{element}</RequireAuth>;
  }

  if (route.allowedRoles?.length) {
    element = (
      <RequireRole sessionState={sessionState} allowedRoles={route.allowedRoles}>
        {element}
      </RequireRole>
    );
  }

  return element;
}

function AppRoutes({ sessionState }) {
  const routeGroups = [
    ...getCoreRoutes(sessionState),
    ...getDirectoryRoutes(sessionState),
    ...getTicketRoutes(sessionState),
    ...getMessagingRoutes(sessionState),
    ...getContentRoutes(sessionState)
  ];

  return (
    <Routes>
      {routeGroups.map(route => (
        <Route key={route.path} path={route.path} element={wrapRouteElement(route, sessionState)} />
      ))}
      <Route
        path="*"
        element={<StatusPage sessionState={sessionState} title="Page not found" message="That route is not available in the React shell." />}
      />
    </Routes>
  );
}

export default AppRoutes;
