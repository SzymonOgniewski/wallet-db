import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../modules/user/model.js";
import dotenv from "dotenv";
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
    if (!user || err || user.token !== reqToken || user.verify === false) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    next();
  })(req, res, next);
};
