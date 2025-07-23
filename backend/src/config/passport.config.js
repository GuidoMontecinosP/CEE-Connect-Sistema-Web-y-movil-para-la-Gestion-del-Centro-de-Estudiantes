import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { ACCESS_TOKEN_SECRET } from "./configEnv.js";

// 1. Define un extractor que lea la cookie
const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies["jwt-auth"];  // el nombre que uses al setearla
  }
  return null;
};

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    cookieExtractor,                           // 1º mira en la cookie
    ExtractJwt.fromAuthHeaderAsBearerToken(),  // 2º mira en el header Authorization
  ]),
  secretOrKey: ACCESS_TOKEN_SECRET,
};

passport.use(
  "jwt",
  new JwtStrategy(opts, async (payload, done) => {
    try {
      // Aquí payload ya trae todo lo que firmaste: id, correo, rol/isAdmin…
      return done(null, payload);
    } catch (error) {
      return done(error, false);
    }
  })
);
