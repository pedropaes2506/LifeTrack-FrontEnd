import React from 'react';
import '../styles/Header.css'; 
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
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
                    <Settings size={24} />
                    <User size={24} />
                </div>
            )}
        </header>
    );
};

export default Header;