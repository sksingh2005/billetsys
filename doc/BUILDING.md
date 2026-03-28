# Building billetsys

This document describes how to build the project, run it locally, and generate the manual documentation.

## Prerequisites

- Java 25
- Maven
- Node.js and npm (for the React frontend)
- PostgreSQL
- Pandoc
- Eisvogel Pandoc template (for PDF manual generation)

## Build the project

```bash
mvn clean package
```

This produces the application artifacts in `target/`. The [Quarkus Quinoa](https://docs.quarkiverse.io/quarkus-quinoa/dev/index.html)
extension automatically runs `npm install` and `npm run build` for the React frontend in
`src/frontend/` as part of this build — no separate frontend build step is required.

## Run the project

Set up PostgreSQL with a database owned by user `ticketdb`:

```bash
dropdb ticketdb
createdb -E UTF8 -O ticketdb ticketdb
```

Start in development mode:

```bash
mvn quarkus:dev
```

On startup, Quinoa automatically installs npm dependencies (if `package.json` has changed) and
starts the Vite dev server. All frontend requests are proxied through Quarkus on port 8080 — you
do not need to run the Vite dev server separately.

The application is available at:

- http://localhost:8080

**Live development:** While `quarkus:dev` is running, changes to Java files are picked up
automatically by Quarkus live reload. Changes to frontend files in `src/frontend/src/` are
reflected instantly in the browser via Vite HMR — no rebuild or restart needed.

## Run tests

```bash
mvn test
```

## Build documentation

Generate English manual HTML and PDF (Eisvogel) into `target/`:

```bash
mvn -Pmanual-docs generate-resources
```

Generated files:

- `target/billetsys-en.html`
- `target/billetsys-en.pdf`
