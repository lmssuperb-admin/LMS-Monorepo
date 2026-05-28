export function getAuthErrorMessage(code) {
  if (!code) return '';
  switch (code) {
    case 'CredentialsSignin':
      return 'Invalid username or password.';
    case 'OAuthAccountNotLinked':
      return 'This account is already linked with another provider.';
    case 'AccessDenied':
      return 'Access denied.';
    case 'Configuration':
      return 'Authentication configuration error.';
    default:
      return 'Authentication failed. Please try again.';
  }
}

export function isGoogleOAuthEnabled() {
  const id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const secret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '';
  return !!(id && secret && !id.includes('your_google') && !secret.includes('your_google'));
}
