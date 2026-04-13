# 🎟️ Book My Ticket — Single-file Server

`index.mjs` is the only running backend. It serves the static login/register pages, mounts the auth router (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`), exposes `/health`, and hosts the transactional seat APIs (`GET /seats`, `PUT /:id`). No separate `app.js`, no refresh/me endpoints—everything lives in one Express file so the legacy Tailwind UI can call the familiar `/seats` route and the booking action while still using JWT cookies.

## 🚀 Features
* `GET /health` for uptime checks.
* Static UI endpoints: `/`, `/login`, `/register`, `/index` (all redirect/serve the HTML version of the login/register seat map; `/index` is protected by JWT).
* Auth routes via `src/modules/auth`: register, login, logout (access/refresh cookies).
* Seat APIs: `GET /seats` returns the grid (normalized to `{ id, name, isbooked, bookedAt }`), `PUT /:id` books a seat within a safe `SELECT … FOR UPDATE` transaction and writes to `bookings`.
* Logout button on the seat map posts to `/api/auth/logout` (credentials included) and directs back to `/login`.

## 📂 Folder structure
```
book-it/
├── index.mjs                   # Solo Express server + seat transaction
├── index.html                  # Legacy seat map UI (Tailwind + logout button)
├── public/
│   └── auth/
│       ├── login.html
│       └── register.html
├── src/
│   ├── common/
│   │   ├── config/             # Postgres pool + Drizzle helpers
│   │   ├── middleware/         # Api error handler, validation guard
│   │   └── utils/              # ApiError, ApiResponse, jwt helpers
│   └── modules/
│       └── auth/               # routes/controllers/services/middleware for JWT
├── docs/.env.example           # Environment template
├── drizzle/                    # Auto-generated migrations + meta
├── docker-compose.yml          # `postgresdb` service used locally
├── init.sql                    # Optional SQL init script
├── package.json
├── readme.md
└── node_modules/
```

## 💻 Installation & run
1. `npm install`
2. Copy `docs/.env.example` → `.env` and fill in:
   * `DATABASE_URL` (or the `DB_*` values for host/port/user/pass/db) pointing to your Postgres.
   * `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`.
   * Optional: `DB_SSL=true` if your Postgres requires SSL.
3. `npm run db:up` to launch Docker Postgres (`postgresdb` service).
4. `npm run db:migrate` to apply Drizzle migrations (`users`, `seats`, `bookings`).
5. Seed seats if needed:
   ```bash
   docker compose exec postgresdb \
     psql -U postgres -d book_it \
     -c "INSERT INTO seats (is_booked) SELECT false FROM generate_series(1, 20) ON CONFLICT (id) DO NOTHING;"
   ```
6. Start the app:
   * Dev: `npm run dev`
   * Prod: `npm start` (runs `node index.mjs`)

## 🧭 Request flow
1. Visit `/login`/`/register` (served from `public/auth`). Logging in sets `accessToken`/`refreshToken` cookies.
2. `/index` (or `/index.html`) is protected by the auth middleware; unauthenticated visitors are redirected to `/login`.
3. `index.html` fetches `/seats` with `credentials: "include"` and renders the grid.
4. Clicking a seat triggers `PUT /:id` with the booking transaction (no client-supplied name—the backend uses `req.user`).
5. Logout button hits `/api/auth/logout` to clear cookies and redirects to `/login`.

## 🗂 API summary
| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register with `{ name, email, password }`. |
| `POST` | `/api/auth/login` | Login, issue JWT cookies. |
| `POST` | `/api/auth/logout` | Clear the cookies. |
| `GET` | `/seats` | Authenticated seat list JSON. |
| `PUT` | `/:id` | Authenticated booking transaction (locks seat, marks `is_booked`, inserts into `bookings`). |
| `GET` | `/health` | Uptime/heartbeat response. |

## 🧠 Notes
* `index.mjs` now squashes the seating logic, the auth router, the static routes, and health checks into one file so the UI and API live together.
* The frontend still expects `{ id, name, isbooked, bookedAt }`; the server normalizes row data so the map works.
* No more `/api/auth/refresh` or `/api/auth/me`; only the three auth routes are exposed.
* `src/modules/auth/auth.middleware.js` handles token extraction, user lookup, and redirects unauthenticated requests such as `/seats` or `/index` to `/login`.
* Drizzle schema in `src/common/db/schema.js` defines `users`, `seats`, `bookings`. Regenerate SQL (`npm run db:generate`) before running migrations if you change the schema.
