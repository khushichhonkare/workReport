import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt as ExtractJWT } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

// Serializing and Deserialize user for session storage
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

// Configuring Google OAuth2 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "763511040816-b8udc42kccb1ppng9vge0o123p3s4ik5.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Use the profile information to identify or create a user
      console.log("accessToken",accessToken)
      console.log("refreshToken",refreshToken)
      console.log("profile",profile)

      return done(null, {accessToken, refreshToken});
    }
  )
);

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: "abc",
};

// JWT Strategy
passport.use(
  new JWTStrategy(opts, async (jwtPayLoad, done) => {
    // Find or create the user based on the JWT payload
    console.log("jwtPayLoad",jwtPayLoad)

    return done(null, jwtPayLoad);
  })
);

export default passport;
