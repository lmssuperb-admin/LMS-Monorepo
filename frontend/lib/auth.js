import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const hasGoogleOAuth =
  googleClientId &&
  googleClientSecret &&
  !googleClientId.includes("your_google") &&
  !googleClientSecret.includes("your_google");

const providers = [
  CredentialsProvider({
    name: "Moodle credentials",
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

        const res = await axios.post(`${apiUrl}/auth/login`, {
          username: credentials.username,
          password: credentials.password,
        });

        if (res.data && res.data.success) {
          const user = res.data.user;
          return {
            id: String(user.id),
            name: user.fullname,
            email: user.email || `${user.username}@moodle.test`,
            image: user.userpictureurl,
            role: user.role,
            moodleToken: res.data.token,
          };
        }
        return null;
      } catch {
        return null;
      }
    },
  }),
];

if (hasGoogleOAuth) {
  providers.unshift(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

if (process.env.NODE_ENV === 'production' && !authSecret) {
  console.error(
    '[NextAuth] NEXTAUTH_SECRET is missing. Set it in Vercel environment variables and redeploy.'
  );
}

export const authOptions = {
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.moodleToken = user.moodleToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.moodleToken = token.moodleToken;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: authSecret,
  // Required on Vercel when NEXTAUTH_URL is not set (NextAuth v4)
  ...(process.env.NEXTAUTH_URL ? { url: process.env.NEXTAUTH_URL } : {}),
};
