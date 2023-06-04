import passport from "passport";
import { findUserRefreshToken } from "../modules/user/controller.js";
import * as userService from "../modules/user/service.js";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../modules/user/model.js";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
const secret = process.env.SECRET;

const strategyOptions = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(strategyOptions, (payload, done) => {
    User.findOne({ _id: payload.id })
      .then((user) =>
        !user ? done(new Error("User not existing")) : done(null, user)
      )
      .catch(done);
  })
);
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.verify(token, secret);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTimestamp;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return true;
    } else if (error.name === "JsonWebTokenError") {
      return true;
    } else {
      throw error;
    }
  }
};
const isValidRefreshToken = (id, oldRefreshToken) => {
  const refreshToken = findUserRefreshToken(id);
  return refreshToken == oldRefreshToken;
};
const generateAuthToken = (user) => {
  const payload = {
    id: user.id,
    useremail: user.email,
    name: user.name,
  };
  const accessToken = jwt.sign(payload, secret, { expiresIn: "1h" });
  const newRefreshToken = nanoid();
  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};
export const auth = async (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user) => {
    const reqToken = req.headers["authorization"]?.slice(7);
    console.log(reqToken, user);
    if (!user || err || user.validationToken !== reqToken) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    const isAuthTokenExpired = isTokenExpired(user.validationToken);
    if (isAuthTokenExpired) {
      const isRefreshTokenValid = isValidRefreshToken(
        user._id,
        user.refreshToken
      );
      if (isRefreshTokenValid) {
        try {
          const { newAuthToken, newRefreshToken } = generateAuthToken(user);
          await userService.saveToken(user._id, newAuthToken, newRefreshToken);
          return res.json({
            status: "success",
            code: 200,
            data: {
              token: newAuthToken,
              refreshToken: newRefreshToken,
            },
          });
        } catch (error) {
          return res.status(500).json({
            status: "error",
            code: 500,
            message: "Internal Server Error",
            data: "Internal Server Error",
          });
        }
      } else {
        return res.status(401).json({
          status: "error",
          code: 401,
          message: "Unauthorized",
          data: "Unauthorized",
        });
      }
    }
    req.user = user;
    next();
  })(req, res, next);
};
