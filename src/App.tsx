import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Cadastro from './components/Cadastro';
import CalendarPage from './components/CalendarPage';
import OfensivaPage from './components/OfensivaPage';
import HabitsManageAdmin from './components/HabitsManageAdmin';
import AboutPage from './components/AboutPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/ofensiva" element={<OfensivaPage />} /> 
        <Route path="/gerenciar-habitos" element={<HabitsManageAdmin />} />
        <Route path="/sobre" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;