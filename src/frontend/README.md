# Frontend Structure

This frontend is a Vite + React application that renders the React shell for `billetsys`.

## Development Workflow

- Run `mvn quarkus:dev` from the repository root for normal frontend and backend development.
- Keep that process running while you edit frontend files so Vite live reload can update the UI.
- Use `mvn clean quarkus:dev` only when you deliberately want to wipe `target/` and force a fresh rebuild.

## Entry Flow

- `src/main.jsx`
  Boots React, sets up `BrowserRouter`, and handles `/app` and `/app/#...` URL normalization before render.
- `src/App.jsx`
  Keeps the top-level shell small. It loads the session, sets the document title, chooses the login vs authenticated shell, and renders `AppRoutes`.
- `src/AppRoutes.jsx`
  Acts as the top-level route registry. It composes focused route-group modules and keeps the catch-all status route in one obvious place.

## Folder Layout

- `src/components/`
  Reusable UI pieces shared across pages.
- `src/components/layout/`
  Shell-level layout components such as the authenticated header, login header, and footer.
- `src/components/common/`
  Common UI helpers such as loading/error state wrappers, badges, and attachment pickers.
- `src/components/markdown/`
  Markdown rendering and editing components.
- `src/components/users/`
  Reusable user-related UI blocks and selectors.
- `src/hooks/`
  Shared React hooks for data loading and external script handling.
- `src/pages/`
  Route-level screens. Page implementations should live here instead of inside `AppRoutes.jsx`.
- `src/routes/`
  Route-group modules plus shared route metadata/path helpers. These files define route records that `AppRoutes.jsx` turns into actual React Router `<Route>` elements.
- `src/utils/`
  Shared non-visual helpers for API calls, routing, formatting, navigation, and form helpers.

## Current Responsibility Split

- Keep `App.jsx` limited to app-shell composition only.
- Keep `AppRoutes.jsx` limited to composing route groups and defining the fallback `*` route.
- Put domain-specific route definitions in `src/routes/`.
- Move reusable UI into `components/`.
- Move repeated fetch/state logic into `hooks/`.
- Move pure helper logic into `utils/`.
- Move self-contained screens into `pages/`.

## Route Organization

- `src/AppRoutes.jsx`
  Collects route records from each route-group module, wraps them with shared loading/error/auth behavior, and renders the final `<Routes>` tree.
- `src/routes/CoreRoutes.jsx`
  Login, home, shell-level status pages, and profile/owner account flows.
- `src/routes/DirectoryRoutes.jsx`
  Admin, support, TAM, user, and superuser directory-style user/company routes.
- `src/routes/TicketRoutes.jsx`
  Ticket workbench routes plus support, user, and superuser ticket flows.
- `src/routes/MessagingRoutes.jsx`
  Message CRUD routes and attachment preview routes.
- `src/routes/ContentRoutes.jsx`
  Companies, articles, categories, entitlements, and support level routes.
- `src/routes/paths.js`
  Shared route/path constants for commonly repeated paths. Use this when paths are referenced from route files, pages, navigation helpers, or redirects.

## How Route Files Work

Each file in `src/routes/` exports a function that returns an array of route records. A route record is a plain object with:

- `path`
  The React Router path string.
- `element`
  The page/component to render.
- `requiresAuth` (optional)
  When true, `AppRoutes.jsx` wraps the route with the shared auth guard.
- `allowedRoles` (optional)
  When present, `AppRoutes.jsx` wraps the route with the shared role guard.

`AppRoutes.jsx` is responsible for applying shared wrappers around every route record:

- `Suspense` for lazy-loaded pages
- `RouteErrorBoundary` for route render/lazy import failures
- `RequireAuth` for authenticated-only routes
- `RequireRole` for role-restricted routes

Route-group files should focus on declaring route intent, not repeating wrapper logic.

## Adding Or Updating A Route

When adding a new screen:

1. Create or update the page component in `src/pages/`.
2. Add the route record to the correct route-group file in `src/routes/`.
3. If the path will be reused in multiple places, add a constant to `src/routes/paths.js`.
4. If the screen requires sign-in, set `requiresAuth: true`.
5. If the screen belongs to a clearly role-scoped route family such as support, TAM, user, or superuser, add `allowedRoles`.
6. If the page is large or not part of the initial shell, prefer lazy-loading it in the route-group file.
7. For day-to-day development, keep `mvn quarkus:dev` running from the repository root and rely on live reload.
8. Run `npm run build` from `src/frontend` when you want a production-style frontend build.

## Choosing The Right Route File

- Put shell/account/login routes in `CoreRoutes.jsx`.
- Put user/company directory-style routes in `DirectoryRoutes.jsx`.
- Put support, user, superuser, or workbench ticket routes in `TicketRoutes.jsx`.
- Put message and attachment routes in `MessagingRoutes.jsx`.
- Put company/article/category/entitlement/level routes in `ContentRoutes.jsx`.

If a new feature grows large enough, create a new route-group file instead of making an existing one too broad.

## Important Files

- `src/hooks/useJson.js`
  Shared JSON loader for authenticated fetch-based page data.
- `src/hooks/useText.js`
  Shared text loader used for lightweight endpoints.
- `src/hooks/useExternalScript.js`
  Loads external browser scripts such as Chart.js only when needed.
- `src/utils/api.js`
  Shared POST/JSON request helpers.
- `src/utils/routing.jsx`
  Client-side route normalization and `SmartLink`. This file is `.jsx` because it exports a React component.
- `src/utils/navigation.js`
  Header navigation and ticket-menu helper logic.
- `src/components/routing/RouteErrorBoundary.jsx`
  Route-level error boundary for page render and lazy import failures.
- `src/components/routing/RouteGuards.jsx`
  Shared route guards for authentication and role-based access.

## Refactor Guidance

- Do not add new page or helper logic back into `src/App.jsx`.
- If a change affects only one route screen, place it in the matching file under `src/pages/`.
- If a change adds or reorganizes paths, update the matching module under `src/routes/` instead of expanding `AppRoutes.jsx`.
- If the same literal path appears in several places, move it into `src/routes/paths.js`.
- Put route access rules in route metadata (`requiresAuth`, `allowedRoles`) instead of hand-rolling checks inside every page when the rule is route-level.
- Keep shared route wrappers in `AppRoutes.jsx`; avoid repeating `Suspense`, error boundaries, or guards inside individual route-group files.
- If code is reused by multiple pages, extract it to `components/`, `hooks/`, or `utils/` instead of duplicating it.
- If route definitions begin repeating heavily inside a route group, consider a small config map, but keep readability first.
- When a shared helper exports JSX, keep the file extension as `.jsx`.

## Build

Run the frontend build from this folder:

```bash
npm run build
```

The build output is written to `dist/`. Quarkus packages those files through Quinoa, while
`mvn quarkus:dev` proxies `/app/*` to the Vite dev server for live frontend updates.

## Backend Integration

- Quarkus serves the frontend under `/app`.
- In development, Quinoa proxies `/app/*` to the Vite dev server on port `5173`.
- Top-level browser routes such as `/profile` are redirected by the backend to `/app/#...`, and `src/main.jsx` converts those locations back into normal client-side routes during app startup.
- Production packaging uses the `dist/` output generated from this frontend project. The legacy generated folder under `src/backend/main/resources/META-INF/resources/app` should not be used as the active frontend source anymore.
