# Book It

This project is a simple seat booking system built with Node.js, Express, PostgreSQL, and Drizzle ORM. The backend is in a single file (`index.mjs`). It serves static HTML pages for login, registration, and seat selection, and provides APIs for authentication and booking.

## Features

- Health check endpoint at `/health`
- Static pages: `/`, `/login`, `/register`, `/index`
- JWT-based authentication using cookies
- Register, login, and logout functionality
- Seat listing and booking APIs
- Transaction-safe booking using `SELECT FOR UPDATE`

## Project structure

```
book-it/
├── index.mjs                   # Main Express server
├── index.html                  # Seat map UI (custom CSS)
├── public/
│   └── auth/
│       ├── login.html
│       └── register.html
├── src/
│   ├── common/
│   │   ├── config/             # Database config
│   │   ├── middleware/         # Error handling and validation
│   │   └── utils/              # Helpers and JWT utilities
│   └── modules/
│       └── auth/               # Auth routes and logic
├── drizzle/                    # Migrations
├── docker-compose.yml          # Local Postgres setup
├── package.json
└── readme.md
```

## Setup

1. Install dependencies:
```
npm install
```

2. Copy environment file:
```
cp docs/.env.example .env
```

Fill in your database and JWT values.

3. Start database (optional if using Docker):
```
npm run db:up
```

4. Run migrations:
```
npm run db:migrate
```

5. Start the server:
```
npm run dev
```

## How it works

- Users register or log in from the HTML pages
- Authentication sets cookies with access and refresh tokens
- The `/index` page is protected and loads only for logged-in users
- The frontend fetches `/seats` and renders the seat grid
- Clicking a seat sends a booking request to the backend
- The backend locks the row and updates booking safely

## API

POST /api/auth/register
Register a new user

POST /api/auth/login
Log in and receive cookies

POST /api/auth/logout
Clear authentication cookies

GET /seats
Get all seats

PUT /:id
Book a seat

GET /health
Check if server is running

## Notes

- The frontend uses plain HTML and CSS. No framework is used.
- All backend logic is inside `index.mjs`.
- Database schema is managed using Drizzle.
- Migrations must be run before starting the app.

