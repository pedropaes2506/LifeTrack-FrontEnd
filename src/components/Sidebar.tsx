import React from 'react';
import '../styles/Sidebar.css';
import { Home, CalendarDays, Flame, Calculator, Info } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
    return (
        <nav className="sidebar">
            <ul className="sidebar-menu">
                <li>
                    <NavLink 
                        to="/dashboard" 
                        className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}
                    >
                        <Home size={28} />
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/calendario" 
                        className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}
                    >
                        <CalendarDays size={28} />
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/ofensiva" 
                        className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}
                    >
                        <Flame size={28} />
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/calculadora" 
                        className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}
                    >
                        <Calculator size={28} />
                    </NavLink>
                </li>
            </ul>
            
            <div className="sidebar-footer">
                <NavLink 
                    to="/info"
                    className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}
                >
                    <Info size={28} />
                </NavLink>
            </div>
        </nav>
    );
};

export default Sidebar;