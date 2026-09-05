import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'sv360_token';
const USER_KEY = 'sv360_user';

function readCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Hydrate synchronously from localStorage so a page refresh never shows a
  // logged-out flash or redirect while we re-verify the session in the background.
  const [user, setUser] = useState(() => readCachedUser());
  const [loading, setLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY) && !readCachedUser());

  const persistUser = useCallback((userObj) => {
    if (userObj) {
      localStorage.setItem(USER_KEY, JSON.stringify(userObj));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    setUser(userObj);
  }, []);

  const verifySession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      persistUser(data.user);
    } catch (err) {
      // Only clear the session on a genuine authentication failure (401/403).
      // Network errors, timeouts, or a cold-starting backend must NOT log the
      // user out -- that was the bug causing refresh-to-login.
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        persistUser(null);
      }
      // otherwise: keep the cached user/session as-is and let the app continue working
    } finally {
      setLoading(false);
    }
  }, [persistUser]);

  useEffect(() => {
    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loginWithToken(token, userObj) {
    localStorage.setItem(TOKEN_KEY, token);
    persistUser(userObj);
    setLoading(false);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    persistUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser: persistUser, loading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
