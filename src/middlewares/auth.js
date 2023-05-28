import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../modules/user/model.js";

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

export const auth = async (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user) => {
    const reqToken = req.headers["authorization"]?.slice(7);
    if (!user || err || user.token !== reqToken ) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};
