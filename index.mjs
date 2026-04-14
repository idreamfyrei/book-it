//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);
import "dotenv/config";
import express from "express";
import pg from "pg";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import ApiError from "./src/common/utils/api-error.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import { authenticate } from "./src/modules/auth/auth.middleware.js";
import errorHandler from "./src/common/middleware/error.middleware.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 8080;
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:8080";

const shouldUseSsl = process.env.DB_SSL === "true";
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    };

const pool = new pg.Pool({
  ...poolConfig,
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

const app = express();
app.use(express.static(join(__dirname, "public")));
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,

  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.sendFile(join(__dirname, "public/auth/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(join(__dirname, "public/auth/register.html"));
});

app.get("/register.html", (req, res) => {
  res.redirect("/register");
});

app.get("/login.html", (req, res) => {
  res.redirect("/login");
});

app.get("/index", authenticate, (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.get("/index.html", authenticate, (req, res) => {
  res.redirect("/index");
});

const normalizeSeats = (rows) =>
  rows.map((row) => ({
    id: row.id,
    name: row.name,
    isbooked: row.is_booked || row.isbooked || false,
    bookedAt: row.booked_at,
  }));

app.get("/seats", authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT id, name, is_booked, booked_at FROM seats ORDER BY id");
    res.json(normalizeSeats(rows));
  } catch (error) {
    next(error);
  }
});

app.put("/:id", authenticate, async (req, res, next) => {
  const seatId = Number(req.params.id);
  if (!Number.isInteger(seatId)) {
    return next(ApiError.badRequest("Seat id must be an integer"));
  }

  const name = req.user?.name || req.user?.email;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const seatResult = await client.query("SELECT id, is_booked FROM seats WHERE id = $1 FOR UPDATE", [seatId]);

    if (seatResult.rowCount === 0) {
      throw ApiError.notFound("Seat not found");
    }

    if (seatResult.rows[0].is_booked) {
      throw ApiError.conflict("Seat already booked");
    }

    const updateResult = await client.query(
      "UPDATE seats SET is_booked = true, name = $2, booked_at = NOW() WHERE id = $1 RETURNING id, name, is_booked, booked_at",
      [seatId, name],
    );

    await client.query("INSERT INTO bookings (user_id, seat_id, booked_at) VALUES ($1, $2, NOW())", [
      req.user.id,
      seatId,
    ]);

    await client.query("COMMIT");
    res.json(normalizeSeats(updateResult.rows)[0]);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    next(error);
  } finally {
    client.release();
  }
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server starting on port: ${port}`);
});
