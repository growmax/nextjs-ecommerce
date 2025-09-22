export const clearAuthData = () => {
  // Client-side auth cleanup is now handled by AuthStorage.clearAuth()
  // Server-side HttpOnly cookies are cleared by the logout API

  // Only clear client-accessible cookie
  const isProduction = process.env.NODE_ENV === "production";
  const secureFlag = isProduction ? "; Secure" : "";

  document.cookie = `access_token_client=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict${secureFlag}`;
  document.cookie = `access_token_client=; max-age=0; path=/; SameSite=Strict${secureFlag}`;
};
