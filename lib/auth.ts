import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import { User } from "@/models/User";
import { themeLevelFromLegacy } from "@/lib/theme-colors";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await connectDB();
        let existing = await User.findOne({ email: user.email.toLowerCase() });

        if (!existing) {
          await User.create({
            email: user.email.toLowerCase(),
            name: user.name || user.email.split("@")[0],
            avatar: user.image ?? undefined,
            googleId: account.providerAccountId,
          });
        } else {
          existing.googleId = account.providerAccountId;
          if (user.image) existing.avatar = user.image;
          await existing.save();
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        await connectDB();
        const dbUser =
          account?.provider === "google" && user.email
            ? await User.findOne({ email: user.email.toLowerCase() })
            : await User.findById(user.id);

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.avatar || user.image;
          token.googleLinked = !!dbUser.googleId;
          token.hasPassword = !!dbUser.passwordHash;
          token.themeLevel =
            dbUser.preferences?.themeLevel ??
            themeLevelFromLegacy(dbUser.preferences?.theme);
        } else if (account?.provider !== "google") {
          token.id = user.id;
          token.picture = user.image;
        }
      }

      if (trigger === "update" && token.id) {
        await connectDB();
        const dbUser = await User.findById(token.id);
        if (dbUser) {
          token.name = dbUser.name;
          token.picture = dbUser.avatar;
          token.googleLinked = !!dbUser.googleId;
          token.hasPassword = !!dbUser.passwordHash;
          token.themeLevel =
            dbUser.preferences?.themeLevel ??
            themeLevelFromLegacy(dbUser.preferences?.theme);
        }
      }

      if (token.id && token.themeLevel === undefined) {
        await connectDB();
        const dbUser = await User.findById(token.id).select("preferences").lean();
        if (dbUser) {
          token.themeLevel =
            dbUser.preferences?.themeLevel ??
            themeLevelFromLegacy(dbUser.preferences?.theme);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string) || session.user.name;
        session.user.email = (token.email as string) || session.user.email;
        session.user.image = (token.picture as string) || null;
        session.user.googleLinked = !!token.googleLinked;
        session.user.hasPassword = !!token.hasPassword;
        session.user.themeLevel =
          typeof token.themeLevel === "number"
            ? token.themeLevel
            : themeLevelFromLegacy(
                token.theme as "dark" | "light" | undefined
              );
      }
      return session;
    },
  },
};
