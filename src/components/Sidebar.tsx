import React from 'react';
import '../styles/Sidebar.css';
import { Home, CalendarDays, Flame, Calculator, Info } from 'lucide-react';

const Sidebar: React.FC = () => {
    return (
        <nav className="sidebar">
            <ul className="sidebar-menu">
                <li className="sidebar-item active">
                    <Home size={28} />
                </li>
                <li className="sidebar-item">
                    <CalendarDays size={28} />
                </li>
                <li className="sidebar-item">
                    <Flame size={28} />
                </li>
                <li className="sidebar-item">
                    <Calculator size={28} />
                </li>
            </ul>
            
            <div className="sidebar-footer">
                <Info size={28} />
            </div>
        </nav>
    );
};

export default Sidebar;