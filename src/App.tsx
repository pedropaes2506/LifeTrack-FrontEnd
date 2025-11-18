import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Cadastro from './components/Cadastro';
import ActivityPage from './components/ActivityPage';

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
      </Routes>
    </Router>
  );
}

export default App;