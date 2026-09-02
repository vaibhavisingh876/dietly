const TOKEN_KEY = "token";
const USER_KEY = "user";

/**
 * Save authentication data in either localStorage
 * or sessionStorage.
 *
 * persist = true  -> stays logged in after browser restart
 * persist = false -> cleared when browser session ends
 */
export function saveAuth({
  token,
  user,
  persist = true,
}) {
  if (!token) {
    throw new Error("Authentication token is required.");
  }

  const store = persist
    ? localStorage
    : sessionStorage;

  const otherStore = persist
    ? sessionStorage
    : localStorage;

  store.setItem(TOKEN_KEY, token);

  if (user !== undefined && user !== null) {
    store.setItem(
      USER_KEY,
      JSON.stringify(user)
    );
  } else {
    store.removeItem(USER_KEY);
  }

  // Prevent stale authentication data from the
  // opposite storage mechanism.
  otherStore.removeItem(TOKEN_KEY);
  otherStore.removeItem(USER_KEY);

  window.dispatchEvent(
    new Event("authChanged")
  );
}

/**
 * Returns the currently stored token.
 */
export function getToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY) ||
    null
  );
}

/**
 * Returns the currently stored user.
 *
 * Invalid/corrupted JSON is safely ignored.
 */
export function getUser() {
  const raw =
    localStorage.getItem(USER_KEY) ||
    sessionStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(
      "Invalid stored user data. Clearing it.",
      error
    );

    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);

    return null;
  }
}

/**
 * Returns whether the user is authenticated.
 */
export function isAuthenticated() {
  return Boolean(getToken());
}

/**
 * Clears all authentication data.
 */
export function logout({
  redirect = true,
} = {}) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  window.dispatchEvent(
    new Event("authChanged")
  );

  if (redirect) {
    window.location.href = "/login";
  }
}