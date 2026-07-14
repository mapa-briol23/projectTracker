import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAccessToken, refreshSession } from '../api/axios';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function restoreSession() {
      try {
        const { data } = await refreshSession();
        setAccessToken(data.access_token);
        const { data: meData } = await authApi.getMe();
        setUser(meData.user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(email, password) {
    const { data } = await authApi.login(email, password);
    setAccessToken(data.access_token);
    setUser(data.user);
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      navigate('/login');
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
