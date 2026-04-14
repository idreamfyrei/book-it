import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

const register = async (req, res) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, "Registration success", user);
};

const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  ApiResponse.ok(res, "Login successful", { user });
};

const logout = async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  ApiResponse.ok(res, "Logout Success");
};



export { register, login, logout };
