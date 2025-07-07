import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        console.log('Stored user on load:', storedUser); // Debug log
        if (storedUser && storedUser._id) {
          setUser(storedUser);
        } else {
          console.log('No valid user found in localStorage');
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      console.log('Login response:', data); // Debug log
      if (data.user && data.token) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      console.log('Register response:', data); // Debug log
      if (data.user && data.token) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
      } else {
        throw new Error('Invalid register response');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};