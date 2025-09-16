export const clearAuthData = () => {
  const localStorageKeys = [
    "access_token",
    "accessToken",
    "refresh-token",
    "refreshToken",
    "userInfo",
    "tenantInfo",
    "user-data",
    "tenant-data",
    "token-expiry",
  ];

  localStorageKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
  });

  const cookieNames = [
    "access_token",
    "refresh-token",
    "auth-token",
    "userSession",
  ];

  cookieNames.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    document.cookie = `${cookieName}=; max-age=0; path=/`;

    const hostname = window.location.hostname;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname}`;

    if (hostname.includes(".")) {
      const rootDomain = hostname.split(".").slice(-2).join(".");
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain}`;
    }
  });
};
