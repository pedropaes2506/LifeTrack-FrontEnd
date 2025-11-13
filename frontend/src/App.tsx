import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Cadastro from './components/Cadastro';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import EmailSentPage from './components/EmailSentPage';
import ActivityPage from './components/ActivityPage'; // Componente de rotina migrado
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente Wrapper para proteger rotas privadas
const PrivateRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
    const { isAuthenticated } = useAuth();
    // Se não estiver autenticado, redireciona para o login
    return isAuthenticated ? <>{element}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="/email-enviado" element={<EmailSentPage />} />

          {/* Rotas Privadas */}
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          {/* Rota dinâmica para a página de detalhes da rotina */}
          <Route path="/rotina/:adesaoId" element={<PrivateRoute element={<ActivityPage />} />} /> 
          {/* Outras Rotas */}
          <Route path="/perfil" element={<PrivateRoute element={<div>Perfil do Usuário (em breve)</div>} />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;