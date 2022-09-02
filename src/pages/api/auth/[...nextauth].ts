import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvier from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"
import Auth0Provider from "next-auth/providers/auth0"

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@server/db/client";
import { env } from "@env/server.mjs";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    redirect({ baseUrl, url }) {
      if (url.includes("/signup")) return baseUrl
      return url
    }
  },
  secret: env.NEXTAUTH_SECRET,
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    // ...add more providers here
    GoogleProvier({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    }),
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET
    }),
    Auth0Provider({
      clientId: env.AUTH0_CLIENT_ID,
      clientSecret: env.AUTH0_CLIENT_SECRET,
      issuer: env.AUTH0_ISSUER
    })
  ],
  logger: {
    debug(code, metadata) {
      console.log("DEBUG: ", code, metadata)
    },
    error(code, metadata) {
      console.error("ERROR: ", code, metadata)
    },
    warn(code) {
      console.warn("WARN: ", code)
    },
  }
};

export default NextAuth(authOptions);
