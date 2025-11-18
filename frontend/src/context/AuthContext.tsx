// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Definição da interface do usuário logado
interface User {
  id: number;
  email: string;
  nome: string; 
  nivelAcesso: 'USER' | 'ADMIN' | 'MODERATOR';
}

// 🚀 ALTERAÇÃO 1: Adicionar a função updateUserName à interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserName: (newName: string) => void; // ⬅️ FUNÇÃO NOVA
}

// Valor padrão do contexto (atualizado para incluir a nova função)
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

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        
        // 🚀 VERIFICAÇÃO ADICIONADA AQUI
        // Verifica se o campo nivelAcesso existe e se é um valor esperado
        const validNiveis = ['USER', 'ADMIN', 'MODERATOR'];
        if (!parsedUser.nivelAcesso || !validNiveis.includes(parsedUser.nivelAcesso)) {
            // Se o objeto for inválido (antigo ou incompleto), lança um erro.
            throw new Error("Dados de usuário armazenados incompletos.");
        }

        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Erro ao restaurar sessão ou dados inválidos:", error);
        
        // ⚠️ Limpa o localStorage para forçar um novo login.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Opcional: Redireciona para o login para uma experiência mais limpa.
        // navigate('/login'); 
      }
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };
  
  // 🚀 ALTERAÇÃO 2: Implementação da função de atualização do nome
  const updateUserName = (newName: string) => {
      setUser(prevUser => {
          if (prevUser) {
              const updatedUser = { ...prevUser, nome: newName };
              // Também atualiza o localStorage para persistência
              localStorage.setItem('user', JSON.stringify(updatedUser)); 
              return updatedUser;
          }
          return prevUser;
      });
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
    // 🚀 ALTERAÇÃO 3: Fornecer a nova função updateUserName no Provider
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, updateUserName }}>
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