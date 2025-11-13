import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Definição da interface do usuário logado (CORRIGIDO: 'nome' adicionado)
interface User {
  id: number;
  email: string;
  nome: string; // AGORA INCLUÍDO
}

// Definição da interface do Contexto
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Valor padrão do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URL Base da API (ajuste conforme a sua configuração)
const API_BASE_URL = 'http://localhost:3000/api/public'; 

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // Carrega o estado de autenticação do localStorage ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        // O JSON.parse agora espera a propriedade 'nome'
        setUser(JSON.parse(storedUser)); 
      } catch (e) {
        console.error("Erro ao parsear dados de usuário do localStorage", e);
        // Limpar dados inválidos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para uso
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Exporta a URL da API para uso nas rotas
export { API_BASE_URL };