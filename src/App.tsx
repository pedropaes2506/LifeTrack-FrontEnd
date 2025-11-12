import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Cadastro from './components/Cadastro';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import EmailSentPage from './components/EmailSentPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/email-enviado" element={<EmailSentPage />} />
      </Routes>
    </Router>
  );
}

export default App;