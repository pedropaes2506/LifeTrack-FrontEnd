import React from 'react';
import '../styles/Header.css'; 
import logo from '../assets/logo.png';
import { Link, NavLink } from 'react-router-dom';
import { Settings, User } from 'lucide-react';

interface HeaderProps {
    showActions?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showActions = true }) => {
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
                    <NavLink 
                        to="/configuracoes" 
                        className={({ isActive }) => isActive ? "header-action-item active" : "header-action-item"}
                    >
                        <Settings size={24} />
                    </NavLink>
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