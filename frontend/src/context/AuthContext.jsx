import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate user from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('taskflow_token');
    const savedUser = localStorage.getItem('taskflow_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('taskflow_token', access_token);
    localStorage.setItem('taskflow_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('taskflow_token', access_token);
    localStorage.setItem('taskflow_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
