// Centralized auth storage helpers.
//
// "Remember me" decides where the session lives:
//   - persist = true  -> localStorage (survives browser restarts)
//   - persist = false -> sessionStorage (cleared when the tab/browser closes)
//
// Every reader checks both stores so it doesn't matter which one an
// active session is sitting in.

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function saveAuth({ token, user, persist = true }) {
  const store = persist ? localStorage : sessionStorage;
  const other = persist ? sessionStorage : localStorage;

  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));

  // Make sure a session isn't left behind in the other store from a
  // previous login with a different "remember me" choice.
  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  window.dispatchEvent(new Event("authChanged"));
  window.location.href = "/login";
}