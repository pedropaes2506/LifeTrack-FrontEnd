import React from 'react';
import '../styles/Header.css'; 
import logo from '../assets/logo.png';
import { Link, NavLink } from 'react-router-dom';
import { User, Wrench } from 'lucide-react'; // ⬅️ ÍCONE Wrench ADICIONADO
import { useAuth } from '../context/AuthContext'; // ⬅️ useAuth ADICIONADO

interface HeaderProps {
    showActions?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showActions = true }) => {
    const { user } = useAuth();
    // Verifica se o usuário tem nível de acesso Admin ou Moderator
    const isAdminOrMod = user && (user.nivelAcesso === 'ADMIN' || user.nivelAcesso === 'MODERATOR');

    return (
        <header className="app-header">
            <Link to="/" className="header-logo-link">
                <img 
                    src={logo} 
                    alt="LifeTrack Logo" 
                    className="header-logo-img" 
                />
                <span className="header-logo-text">LifeTrack</span>
            </Link>
            
            {showActions && (
                <div className="header-actions">
                    {/* 🚀 ÍCONE DE ADMIN/CRUD CONDICIONAL */}
                    {isAdminOrMod && (
                        <NavLink 
                            to="/admin/rotinas" // ⬅️ Nova rota para o CRUD
                            className={({ isActive }) => isActive ? "header-action-item active" : "header-action-item"}
                        >
                            <Wrench size={24} /> 
                        </NavLink>
                    )}
                    <NavLink 
                        to="/perfil" 
                        className={({ isActive }) => isActive ? "header-action-item active" : "header-action-item"}
                    >
                        <User size={24} />
                    </NavLink>
                </div>
            )}
        </header>
    );
};

export default Header;