# Location Manager

A full-stack web app where users register, log in, and manage their **own** locations on an interactive map. Locations can be added one at a time with a form, or in bulk by uploading a ZIP file that contains a single text file.

- **Frontend:** React 19 + Vite, TypeScript, Tailwind CSS v4, react-leaflet, React Router, TanStack Query
- **Backend:** Node.js + Express 5, TypeScript, PostgreSQL, JWT authentication
- **Bonus:** Dockerised backend (Dockerfile + Docker Compose with PostgreSQL)

---

## Features

| Page | What it does |
|---|---|
| **Register** (`/register`) | Create an account with email + password (min. 8 characters). You're signed in straight away. |
| **Login** (`/login`) | Sign in. Visiting a protected page while signed out redirects here, then back to that page after you log in. |
| **Map** (`/map`) | Interactive OpenStreetMap map of your locations. Add one with the name / latitude / longitude form: the marker appears immediately (no page refresh) and the map pans to it. Click a marker to see its name. |
| **Upload** (`/upload`) | Upload a `.zip` containing exactly one `.txt` file. On success a confirmation popup shows for 3 seconds, then the locations are added to your map and you're taken to it. Anything else in the ZIP shows an error popup for 3 seconds. |

The sidebar (a top bar on small screens) links between Map and Upload and has a **Log out** button.

### Data privacy
Every location belongs to the user who created it. The API reads the user id **only** from the verified JWT, and every database query is filtered by it, so one user can never read another user's markers. The client also clears all cached data when the signed-in user changes.

---

## Setup

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | 22.12 or newer | Includes npm. Developed on Node 26. |
| [Git](https://git-scm.com/) | any | To clone the repository |
| **One of:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Compose 2.24 or newer | Recommended: runs PostgreSQL with one command. On Windows it needs WSL 2, which the installer sets up. |
| **or:** [PostgreSQL](https://www.postgresql.org/download/) | 13 or newer | If you'd rather not use Docker |

Check your versions:

```bash
node --version
docker compose version     # only if using Docker
```

### 1. Clone and install

```bash
git clone https://github.com/ahpenggggg/haxon-assessment.git
cd haxon-assessment
npm install
```

`npm install` installs both workspaces (`server/` and `client/`) from the root. Run every command in this guide from the repository root.

### 2. Configure the API

Create `server/.env` from the example:

```bash
cp server/.env.example server/.env              # macOS / Linux
Copy-Item server\.env.example server\.env       # Windows PowerShell
```

Generate a secret and paste it into `JWT_SECRET=` in `server/.env`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

The default `DATABASE_URL` (`postgres://postgres:postgres@localhost:5432/loc_mgmt`) matches the Docker database in step 3. If you use your own PostgreSQL, change the user, password or database name to match. All settings are listed under [Environment variables](#environment-variables-serverenv).

### 3. Start PostgreSQL

**With Docker (recommended):**

```bash
docker compose up -d db
docker compose ps          # wait until db shows "healthy"
```

This starts PostgreSQL 17 on port 5432 with a `loc_mgmt` database. Data is kept in a Docker volume between restarts.

**With a local PostgreSQL:** create the database, then make sure `DATABASE_URL` in `server/.env` uses your PostgreSQL username and password.

```bash
createdb loc_mgmt                              # or in psql: CREATE DATABASE loc_mgmt;
```

You don't need to create any tables: the API creates them when it starts.

### 4. Run the app

Use two terminals, both at the repository root:

```bash
npm run dev:server     # API     → wait for "API listening on http://localhost:4000"
npm run dev:client     # web app → wait for "Local: http://localhost:5173"
```

Open **http://localhost:5173**. The Vite dev server forwards every `/api` request to the API on port 4000, so the browser only ever talks to one address and the login cookie works without any CORS setup.

### 5. Check it works

1. Go to http://localhost:5173/map: you're redirected to the login page.
2. Click **Register** and create an account. You land on the map.
3. Add a location (for example `Suria KLCC`, `3.157324409`, `101.7121981`): the marker appears straight away. Click it to see the name.
4. Go to **Upload** and upload a ZIP made as described in [Upload file format](#upload-file-format). After a 3-second confirmation you're taken back to the map with the new markers.
5. Log out and register a second account: its map is empty.

### 6. Run the tests

```bash
npm test               # server + client tests
npm run lint
npm run typecheck
```

The tests don't need PostgreSQL or a `.env` file. The API tests use an in-memory PostgreSQL ([PGlite](https://pglite.dev/)) that is started automatically.

### Environment variables (`server/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | yes | – | PostgreSQL connection string, e.g. `postgres://postgres:postgres@localhost:5432/loc_mgmt` |
| `JWT_SECRET` | yes | – | Secret for signing tokens, **at least 32 characters**. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `PORT` | no | `4000` | API port |
| `JWT_EXPIRES_IN_SECONDS` | no | `86400` | Session lifetime (1 day) |
| `COOKIE_SECURE` | no | `false` | Set to `true` when served over HTTPS |

The Vite dev server proxies `/api` to `http://localhost:4000`. Set `API_PROXY_TARGET` before `npm run dev:client` to point it somewhere else.

## Running the backend with Docker (bonus)

This runs both PostgreSQL and the API in containers. You still run the web app with npm.

1. Complete steps 1–2 of [Setup](#setup). The container reads the same `server/.env`; only `DATABASE_URL` is overridden to point at the `db` container.
2. Stop `npm run dev:server` if it's running, since the API container also uses port 4000.
3. Start the containers and the web app:

```bash
docker compose up --build   # PostgreSQL on :5432, API on :4000
npm run dev:client          # web app on :5173, in a second terminal
```

To stop: `docker compose down`. To also delete the database data: `docker compose down -v`.

The API image is a multi-stage build (`server/Dockerfile`, built from the repo root because the workspaces share one lockfile). It contains only production dependencies and the compiled JavaScript, and runs as the non-root `node` user.

## Troubleshooting

| Problem | Cause and fix |
|---|---|
| `Invalid environment configuration` when the API starts | `server/.env` is missing, or `JWT_SECRET` is shorter than 32 characters. Redo [step 2](#2-configure-the-api). |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL isn't running. Run `docker compose up -d db`, or start your local PostgreSQL service. |
| `password authentication failed for user` | The username or password in `DATABASE_URL` doesn't match your PostgreSQL. |
| `database "loc_mgmt" does not exist` | Local PostgreSQL only: run `createdb loc_mgmt`. |
| `port is already allocated` / `EADDRINUSE` | Something else uses port 5432, 4000 or 5173. For 5432, stop the other PostgreSQL or use it instead of Docker. For 4000, stop the other API process. |
| Docker Compose error about `env_file` or `required` | Your Docker Compose is older than 2.24. Update Docker Desktop. |
| `npm warn install-scripts ... esbuild` during `npm install` | Harmless. npm 11 asks before running install scripts, and the app and tests work without esbuild's. |
| The map is grey with no streets | The map images come from openstreetmap.org, so you need an internet connection. |

---

## Upload file format

Upload a **`.zip`** file (max 1 MB) that contains **exactly one `.txt` file**. Folders inside the ZIP are fine, but any other file (a second `.txt`, a `.csv`, macOS `__MACOSX/` metadata…) makes the upload invalid.

The text file is UTF-8, one location per line:

```
Name, Latitude, Longitude
Suria KLCC,3.157324409,101.7121981
Zoo Negara,3.21054160,101.75920504
```

- The header line is optional. Blank lines are ignored. Windows or Unix line endings both work.
- Latitude must be between -90 and 90, longitude between -180 and 180.
- Latitude and longitude are the **last two** values on the line, so a name may itself contain commas (`Kuala Lumpur, KL,3.1,101.7`).
- **All or nothing:** if any line is invalid, nothing is imported and the error popup names the bad lines.
- Up to 5,000 locations per file.

To build a test file:

```bash
# macOS / Linux
printf 'Name, Latitude, Longitude\nSuria KLCC,3.157324409,101.7121981\nZoo Negara,3.21054160,101.75920504\n' > locations.txt
zip locations.zip locations.txt
```

```powershell
# Windows PowerShell
"Name, Latitude, Longitude`nSuria KLCC,3.157324409,101.7121981`nZoo Negara,3.21054160,101.75920504" | Set-Content -Encoding utf8 locations.txt
Compress-Archive locations.txt locations.zip -Force
```

---

## API

All endpoints are under `/api`. Errors return `{ "error": { "message": "..." } }`.

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/auth/register` | – | `{ email, password }` | `201 { user }`, sets session cookie |
| `POST` | `/auth/login` | – | `{ email, password }` | `200 { user }`, sets session cookie |
| `POST` | `/auth/logout` | – | – | `204`, clears cookie |
| `GET` | `/auth/me` | ✓ | – | `200 { user }` |
| `GET` | `/locations` | ✓ | – | `200 { locations }` |
| `POST` | `/locations` | ✓ | `{ name, latitude, longitude }` | `201 { location }` |
| `POST` | `/locations/upload` | ✓ | multipart, field `file` (ZIP) | `201 { locations }` |
| `GET` | `/health` | – | – | `200 { status: "ok" }` |

### How authentication works
On register or login the API signs a JWT (HS256, `sub` = user id) and returns it in an **httpOnly, SameSite=Strict cookie** rather than in the response body. Page scripts can't read the token, which protects it from XSS, and the browser sends it automatically on same-origin API calls. Protected routes verify the token on every request. In the client, `RequireAuth` checks the session (`GET /auth/me`) and redirects unauthenticated visitors to `/login`. Any `401` from the API, for example an expired token, signs the user out of the UI.

---

## Project structure

```
client/                      React + Vite web app
  src/app/                   router, layout (sidebar), query client, route constants
  src/features/auth/         login/register pages, session hooks, route guards
  src/features/locations/    map page, add form, upload page, API service + hooks
  src/shared/                API client and shared UI (Button, TextField, TimedPopup…)
server/                      Express API
  src/modules/auth/          routes → service → users repository, JWT + auth middleware
  src/modules/locations/     routes → service → repository, ZIP + text-file parsing
  src/db/                    pg pool and schema (applied on start-up)
  src/http/                  error types and the error handler
  tests/                     unit + API tests
docs/requirements.md         requirement checklist and decisions
docker-compose.yml           PostgreSQL + API
```

## Scripts (from the repo root)

| Command | What it does |
|---|---|
| `npm run dev:server` | API with auto-reload (`tsx watch`) |
| `npm run dev:client` | Vite dev server |
| `npm test` | All tests (server + client) |
| `npm run lint` | ESLint for both workspaces |
| `npm run typecheck` | TypeScript type-check for both workspaces |
| `npm run build` | Production build of both workspaces |

## Testing

- **Server:** Vitest + Supertest. The API tests run against **PGlite**, an in-memory PostgreSQL, so they execute the real SQL with no database to set up. They cover registration and login, tampered tokens, the auth guard, user isolation (User B sees none of User A's markers), and successful and rejected uploads, checking that nothing is imported when a file is rejected. The ZIP and text-file parsers have their own unit tests.
- **Client:** Vitest + React Testing Library, with `fetch` stubbed at the network boundary. Tests cover the 3-second popups, the "confirm first, then add to the map" upload flow, and the login redirect for unauthenticated visitors.
