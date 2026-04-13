import ApiError from "../../common/utils/api-error.js";
import { verifyAccessToken } from "../../common/utils/jwt.utils.js";
import { db } from "../../common/config/db.js";
import { users } from "../../common/db/schema.js";
import { eq } from "drizzle-orm";

const redirectRoutes = ["/seats", "/seats-map", "/index", "/index.html"];

const wantsJson = (req) => {
  const xhr = req.headers["x-requested-with"] === "XMLHttpRequest";
  const acceptsJson = req.headers.accept?.includes("application/json");
  return xhr || acceptsJson;
};

const redirectToLogin = (req, res, message) => {
  const encoded = encodeURIComponent(message ?? "Please log in first");
  return res.redirect(`/login?message=${encoded}`);
};

const respondUnauthorized = (req, res, error) => {
  const message = error?.message ?? "Authentication required";
  if (wantsJson(req)) {
    return res.status(error?.statusCode || 401).json({
      success: false,
      message,
    });
  }
  if (redirectRoutes.includes(req.path)) {
    return redirectToLogin(req, res, message);
  }
  return res.status(error?.statusCode || 401).json({
    success: false,
    message,
  });
};

const authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

  if (!token) throw ApiError.loginRequired();
;

    const decoded = verifyAccessToken(token);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (!user) throw ApiError.unauthorized("User no longer exists");

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    next();
  } catch (error) {
    return respondUnauthorized(req, res, error);
  }
};

export { authenticate };
