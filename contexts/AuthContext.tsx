'use client';

import { loginUser } from '@/services/auth.service';
import { getProfile } from '@/services/user.service';
import { User } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';


interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () =>{
      try {
        const res = getProfile();
        setUser(res);
      } catch{
        setUser(null);
      }finally{
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await loginUser({email, password});
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


