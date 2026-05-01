import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('smartstore_auth');
    if (saved) {
      try {
        const { token: t, user: u } = JSON.parse(saved);
        setToken(t);
        setUser(u);
      } catch (_) {}
    }
    setLoading(false);
  }, []);

  const login = (tokenVal, userVal) => {
    setToken(tokenVal);
    setUser(userVal);
    localStorage.setItem('smartstore_auth', JSON.stringify({ token: tokenVal, user: userVal }));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smartstore_auth');
  };

  // Role helpers
  const isAdmin   = user?.role === 'admin';
  const isManager = ['admin', 'manager'].includes(user?.role);
  const isStaff   = user?.role === 'staff';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isManager, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
