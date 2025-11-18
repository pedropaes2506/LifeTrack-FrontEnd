import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Cadastro from './components/Cadastro';
import ActivityPage from './components/ActivityPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import EmailSentPage from './components/EmailSentPage';
import CalendarPage from './components/CalendarPage';
import OfensivaPage from './components/OfensivaPage';
import HabitsManageAdmin from './components/HabitsManageAdmin';
import AlterarSenha from './components/AlterarSenha';
import MeuPerfil from './components/MeuPerfil';
import Calculadora from './components/Calculadora';
import AboutPage from './components/AboutPage';
import SupportPage from './components/SupportPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cadastro" element={<Cadastro />} />
        
        {/* MUDANÇA: Rota dinâmica */}
        <Route path="/rotina/:slug" element={<ActivityPage />} />

        {/* Rotas antigas removidas (HydrationPage, ExercisePage) */}
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/email-enviado" element={<EmailSentPage />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/ofensiva" element={<OfensivaPage />} /> 
        <Route path="/gerenciar-habitos" element={<HabitsManageAdmin />} />
        <Route path="/alterar-senha" element={<AlterarSenha />} />
        <Route path="/meu-perfil" element={<MeuPerfil />} />
        <Route path="/calculadora" element={<Calculadora />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="/suporte" element={<SupportPage />} />
      </Routes>
    </Router>
  );
}

export default App;