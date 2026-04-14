# Book My Ticket

A seat booking project built with Node.js, Express, PostgreSQL, JWT authentication, and simple HTML pages.

This project lets users:
- register an account
- log in
- view available and booked seats
- book a seat securely
- stay logged in using access token + refresh token flow

**Deployment** [Book It](https://book-it-bxi3.onrender.com/login)

## Tech Used

- Node.js
- Express.js
- PostgreSQL
- JWT (`jsonwebtoken`) for authentication
- `bcryptjs` for password hashing
- `cookie-parser` for reading refresh token cookies
- `cors` for cross-origin support
- Joi for request validation
- CSS for styling
- Docker and Docker Compose for container setup

## Features

- User registration
- User login
- Protected routes using JWT auth middleware
- View all seats
- Book a seat
- Concurrency-safe booking using SQL transaction and `FOR UPDATE`
- Error formatting middleware
- Input validation with DTOs
- Simple frontend with login, register, and seat selection pages

## Project Structure

```text
book-it/
├── index.mjs                   # Main Express server
├── index.html                  # Seat map UI (custom CSS)
├── public/
│   └── auth/                   # Login and register HTML pages
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

## How It Works

### 1. Express server

The app starts from `index.mjs`.

It:
- creates the Express server
- connects to PostgreSQL using a connection pool
- serves HTML pages
- implements auth routes
- uses a global error handler

### 2. Authentication

The auth flow is:
- user registers with username and password
- password is hashed before storing in DB
- user logs in
- server returns an access token
- server also sets a refresh token in a cookie
- protected routes check the access token
- when access token expires, frontend asks for a new one using refresh token

### 3. Seat booking

When a user books a seat:
- server starts a DB transaction
- server locks the selected seat row using `FOR UPDATE`
- if seat is already booked, request fails
- otherwise server updates the row and commits the transaction

It prevents two users from booking the same seat at the same time.

## Installation

### Option 1: Run locally

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Update `.env` with your database and JWT values.

4. Start PostgreSQL and create the database.

5. Run DB setup:

```bash
node setup-db.mjs
```

6. Start the server:

```bash
npm run dev
```

Or:

```bash
npm start
```

### Option 2: Run with Docker

```bash
docker-compose up --build
```

The app will run on:

```text
http://localhost:8080
```


## Key Learnings

- serve HTML files
- return JSON data
- global error handling through middleware
- read Bearer token
- block access when token is missing
- validations and sanitisation
- insert SQL query
- SQL transactions
- backend deployement and debugging
- database setup in production

## Screenshots

- **Login**
  <img width="1451" height="911" alt="image" src="https://github.com/user-attachments/assets/e9acf8cc-2208-4d20-b7e0-57c7617eb91f" />

- **Register**
  <img width="1459" height="933" alt="image" src="https://github.com/user-attachments/assets/097c12c7-a09d-4523-8f2b-3093f468c0f1" />

- **Seat booking**
  <img width="1470" height="950" alt="image" src="https://github.com/user-attachments/assets/91292ef6-9777-49b0-bf1a-a7e2ed308a1d" />

## Note

- All backend logic is inside `index.mjs`.
- Database schema is managed using Drizzle.
- Migrations must be run before starting the app.

This is a hobby project.
