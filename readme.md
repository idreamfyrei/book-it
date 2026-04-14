# Book It

A simple seat booking system built with Node.js, Express, PostgreSQL, and Drizzle ORM. The project focuses on backend fundamentals such as authentication, transactions, and concurrency handling, while serving a lightweight HTML + CSS frontend.

**Deployment** [Book It](https://book-it-bxi3.onrender.com/login)

This application allows users to register, log in, view seats, and book a seat safely. It demonstrates how to handle real-world problems like concurrent bookings using database transactions.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Drizzle ORM (migrations)
- JWT for authentication
- bcryptjs for password hashing
- cookie-parser for handling cookies
- Joi for validation
- Plain HTML and CSS (no frontend framework)

## Features

- User registration and login
- JWT-based authentication
- Protected routes
- View all seats
- Book a seat
- Concurrency-safe booking using SQL transactions and SELECT FOR UPDATE
- Error handling middleware
- Input validation

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

```
NODE_ENV=development
PORT=8080
DATABASE_URL=DATABASE_URL=postgresql://username:password@host:5432/database_name
DB_HOST=localhost
DB_PORT=5432
DB_USER=db_username
DB_PASSWORD=db_password
DB_NAME=db_name
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SERVER_URL=http://localhost:8080
```

4. Run database migrations

```
npm run db:migrate
```

5. Start the server:

```bash
npm run dev
```


### Run Docker

```bash
npm run db:up
```

The app will run on:

```text
http://localhost:8080
```

## How It Works

1. User registers or logs in from the HTML pages
2. Server validates credentials and returns JWT tokens
3. Access token is used for protected requests
4. Refresh token is stored in cookies for session persistence
5. Frontend loads seats from the backend
6. User selects a seat to book
7. Backend locks the row using SELECT FOR UPDATE
8. Booking is completed safely without race conditions

## API Endpoints

### Authentication

- `POST /api/auth/register`

Request body:
```
{
  "name": "John",
  "email": "john@example.com",
  "password": "12345678"
}
```

- `POST /api/auth/login`

Request body:
```
{
  "email": "john@example.com",
  "password": "123456"
}
```

- `POST /api/auth/logout`

### Seats

- `GET /seats`

Returns all seats only when user is logged in

- `PUT /:id`

Books a seat

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
