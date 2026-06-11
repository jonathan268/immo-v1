import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env";
import { googleAuthService } from "../modules/auth/auth.service";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.google.clientId,
      clientSecret: env.google.clientSecret,
      callbackURL: env.google.callbackUrl,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await googleAuthService(profile);
        done(null, user);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  )
);

export default passport;
