import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { ACCESS_TOKEN_SECRET } from "./configEnv.js";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ACCESS_TOKEN_SECRET,
};

passport.use(
  "jwt",
  new JwtStrategy(opts, async (payload, done) => {
    try {
      // Puedes verificar el usuario si lo deseas:
      return done(null, payload); // payload contiene id, correo, rol, etc.
    } catch (error) {
      return done(error, false);
    }
  })
);
