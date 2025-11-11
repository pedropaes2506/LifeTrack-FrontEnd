import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Cadastro from './components/Cadastro';
import HydrationPage from './components/HydrationPage'; 
import ExercisePage from './components/ExercisePage'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/hidratacao" element={<HydrationPage />} />
        <Route path="/exercicio" element={<ExercisePage />} /> 
      </Routes>
    </Router>
  );
}

export default App;