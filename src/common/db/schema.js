import {
  pgTable,
  uuid,
  serial,
  integer,
  varchar,
  text,
  pgEnum,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["customer", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 322 }).notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("customer"),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: varchar("verification_token"),
  refreshToken: varchar("refresh_token"),
  resetPasswordToken: varchar("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const seats = pgTable("seats", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  isBooked: boolean("is_booked").notNull().default(false),
  bookedAt: timestamp("booked_at"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  seatId: integer("seat_id").notNull().references(() => seats.id),
  bookedAt: timestamp("booked_at").notNull().defaultNow(),
});
