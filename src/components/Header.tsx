import React from 'react';
import '../styles/Header.css'; 
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

interface HeaderProps {
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
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
            
            <div className="header-actions">
                {children}
            </div>
        </header>
    );
};

export default Header;