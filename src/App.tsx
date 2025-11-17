import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Cadastro from './components/Cadastro';
import AlterarSenha from './components/AlterarSenha';
import MeuPerfil from './components/MeuPerfil';
import Calculadora from './components/Calculadora';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alterar-senha" element={<AlterarSenha />} />
        <Route path="/meu-perfil" element={<MeuPerfil />} />
        <Route path="/calculadora" element={<Calculadora />} />
      </Routes>
    </Router>
  );
}

export default App;