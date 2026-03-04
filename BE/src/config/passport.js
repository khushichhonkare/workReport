import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { encrypt } from '../utils/encryption.js';

export default function configurePassport(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: [
          'profile',
          'email',
          'https://www.googleapis.com/auth/calendar.readonly',
        ],
        accessType: 'offline',
        prompt: 'consent',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            user.accessToken = accessToken;
            if (refreshToken) {
              user.refreshToken = encrypt(refreshToken);
            }
            user.tokenExpiry = new Date(Date.now() + 3600 * 1000);
            user.picture = profile.photos?.[0]?.value || user.picture;
            await user.save();
          } else {
            user = await User.create({
              googleId: profile.id,
              email: profile.emails?.[0]?.value,
              name: profile.displayName,
              picture: profile.photos?.[0]?.value,
              accessToken,
              refreshToken: encrypt(refreshToken),
              tokenExpiry: new Date(Date.now() + 3600 * 1000),
            });
          }

          return done(null, user);
        } catch (error) {
          console.error('Passport Google Strategy Error:', error);
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}
