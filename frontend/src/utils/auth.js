const TOKEN_KEY = "token";
const USER_KEY = "user";

export function saveAuth({
  token,
  user,
  persist = true,
}) {
  if (!token) {
    throw new Error("Authentication token is required.");
  }

  const primaryStorage = persist ? localStorage : sessionStorage;
  const secondaryStorage = persist ? sessionStorage : localStorage;

  primaryStorage.setItem(TOKEN_KEY, token);

  if (user) {
    primaryStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  secondaryStorage.removeItem(TOKEN_KEY);
  secondaryStorage.removeItem(USER_KEY);

  window.dispatchEvent(new Event("authChanged"));
}

export function getToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY)
  );
}

export function getUser() {
  const rawUser =
    localStorage.getItem(USER_KEY) ||
    sessionStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function logout({ redirect = true } = {}) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  window.dispatchEvent(new Event("authChanged"));

  if (redirect) {
    window.location.href = "/login";
  }
}