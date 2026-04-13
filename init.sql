CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE IF NOT EXISTS role AS ENUM ('customer', 'admin');

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  email varchar(322) NOT NULL UNIQUE,
  password text NOT NULL,
  role role NOT NULL DEFAULT 'customer',
  is_verified boolean NOT NULL DEFAULT false,
  refresh_token varchar,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seats (
  id serial PRIMARY KEY,
  name varchar(255),
  is_booked boolean NOT NULL DEFAULT false,
  booked_at timestamp
);

CREATE TABLE IF NOT EXISTS bookings (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  seat_id integer NOT NULL REFERENCES seats(id),
  booked_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT bookings_seat_id_unique UNIQUE (seat_id)
);

INSERT INTO seats (is_booked)
SELECT false FROM generate_series(1, 20)
ON CONFLICT DO NOTHING;

INSERT INTO users (name, email, password)
VALUES
  ('Demo User', 'demo@example.com', '$2a$12$KIXQ5mvY/3Ql7cKk1AkMOu0QfS0oZtEZQzBa7p6JzG5Bzzl2bG6hC')
ON CONFLICT (email) DO NOTHING;
