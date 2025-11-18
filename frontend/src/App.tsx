import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Cadastro from './components/Cadastro';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import EmailSentPage from './components/EmailSentPage';
import ActivityPage from './components/ActivityPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import CalendarPage from './components/CalendarPage';
import OfensivaPage from './components/OfensivaPage';
import CalculadoraPage from './components/CalculadoraPage';
import MeuPerfil from './components/MeuPerfil';
import AlterarSenhaPage from './components/AlterarSenha';
import AboutPage from './components/AboutPage';
import SupportPage from './components/SupportPage';
import HabitsManageAdmin from './components/HabitsManageAdmin';

const PrivateRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
    const { isAuthenticated } = useAuth();
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
          <Route path="/rotina/:adesaoId" element={<PrivateRoute element={<ActivityPage />} />} /> 
          <Route path="/calendario" element={<PrivateRoute element={<CalendarPage />} />} />
          <Route path="/ofensiva" element={<PrivateRoute element={<OfensivaPage />} />} />
          <Route path="/calculadora" element={<PrivateRoute element={<CalculadoraPage />} />} />
          <Route path="/perfil" element={<PrivateRoute element={<MeuPerfil />} />} />
          <Route path="/alterar-senha" element={<PrivateRoute element={<AlterarSenhaPage />} />} />
          <Route path="/sobre" element={<PrivateRoute element={<AboutPage />} />} />
          <Route path="/suporte" element={<PrivateRoute element={<SupportPage />} />} />

          {/* Rotas de Admin */}
          <Route path="/admin/rotinas" element={<PrivateRoute element={<HabitsManageAdmin />} />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;