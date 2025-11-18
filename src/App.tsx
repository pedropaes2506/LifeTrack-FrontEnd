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
      </Routes>
    </Router>
  );
}

export default App;