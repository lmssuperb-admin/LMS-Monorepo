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
        // If backend responded but indicated failure, throw so NextAuth can surface the message
        const msg = res?.data?.message || 'Invalid credentials';
        throw new Error(msg);
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || 'System authentication error';
        throw new Error(msg);
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

/** Vercel sets VERCEL_URL automatically; use it when NEXTAUTH_URL is not set. */
function resolveNextAuthUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return undefined;
}

const nextAuthUrl = resolveNextAuthUrl();

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
  ...(nextAuthUrl ? { url: nextAuthUrl } : {}),
};
