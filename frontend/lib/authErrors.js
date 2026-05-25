/** User-facing messages for NextAuth error query params (?error=...) */
export function getAuthErrorMessage(code) {
  const messages = {
    Configuration:
      'Sign-in is not configured on the server. In Vercel → Settings → Environment Variables, set NEXTAUTH_URL to your site URL, NEXTAUTH_SECRET to a random string, and NEXT_PUBLIC_API_URL to your API. Then redeploy.',
    CredentialsSignin:
      'Invalid username or password, or the login API could not be reached. Check NEXT_PUBLIC_API_URL points to your deployed Node API.',
    OAuthSignin: 'Google sign-in failed to start. Check Google OAuth credentials in Vercel.',
    OAuthCallback:
      'Google sign-in callback failed. In Google Cloud Console, add this redirect URI: https://YOUR-DOMAIN.vercel.app/api/auth/callback/google',
    OAuthAccountNotLinked:
      'This email is already linked to another sign-in method. Use Moodle credentials instead.',
    AccessDenied: 'Access was denied. Your account may be suspended.',
    Default: 'Sign-in failed. Please try again or contact your administrator.',
  };
  return messages[code] || messages.Default;
}

export function isGoogleOAuthEnabled() {
  const id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  return Boolean(id && !id.includes('your_google'));
}
