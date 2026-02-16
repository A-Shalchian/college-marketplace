import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = (params.email as string).trim().toLowerCase();
        if (!email.endsWith("@georgebrown.ca")) {
          throw new ConvexError(
            "Only @georgebrown.ca email addresses are allowed"
          );
        }
        return {
          email,
          name: (params.name as string) ?? email.split("@")[0],
          createdAt: Date.now(),
        };
      },
    }),
  ],
});
