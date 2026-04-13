import crypto from "crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../common/config/db.js";
import ApiError from "../../common/utils/api-error.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";
import { users } from "../../common/db/schema.js";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, refreshToken, verificationToken, ...safe } = user;
  return safe;
};

const register = async ({ name, email, password }) => {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length) throw ApiError.conflict("Email already exists");

  const hashedPassword = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });

  return sanitizeUser(user);
};

const login = async ({ email, password }) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const passwordsMatch = await bcrypt.compare(password, user.password);
  if (!passwordsMatch) throw ApiError.unauthorized("Invalid email or password");

  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });

  await db
    .update(users)
    .set({ refreshToken: hashToken(refreshToken) })
    .where(eq(users.id, user.id));

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};


const logout = async (userId) => {
  await db
    .update(users)
    .set({ refreshToken: null })
    .where(eq(users.id, userId));
};


export { register, login, logout };
