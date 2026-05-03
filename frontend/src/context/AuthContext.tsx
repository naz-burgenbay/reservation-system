import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, getMe } from '../api/auth';
import type { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('access')
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setIsAuthenticated(false);
      });
  // Запускается один раз при монтировании. Восстанавливает пользователя из сохранённого токена.
  }, []);

  async function login(username: string, password: string) {
    const res = await apiLogin(username, password);
    localStorage.setItem('access', res.data.access);
    localStorage.setItem('refresh', res.data.refresh);
    setIsAuthenticated(true);
    const me = await getMe();
    setUser(me.data);
  }

  function logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setIsAuthenticated(false);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
