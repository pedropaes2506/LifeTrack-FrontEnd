import React from 'react';
import { Link } from 'react-router-dom'; 
import Header from './Header';
import Sidebar from './Sidebar';
import HabitCard from './HabitCard';
import '../styles/App.css';
import '../styles/Dashboard.css'; 

import { Settings, Bell, User } from 'lucide-react';

import { Droplet, Dumbbell, Bed, Brain, Utensils, BookOpen } from 'lucide-react';

const DashboardPage: React.FC = () => {
    return (
        <div className="dashboard-layout">
            <Header>
                <Settings size={24} />
                <Bell size={24} />
                <User size={24} />
            </Header>
            
            <Sidebar />
            
            <main className="dashboard-main-content">
                <div className="dashboard-header">
                    <h2>Olá, usuário!</h2>
                    <p>Aqui está o resumo do seu dia:</p>
                </div>

                <div className="habit-grid">
                    
                    <Link to="/hidratacao" className="habit-card-link">
                        <HabitCard 
                            Icon={Droplet} 
                            title="Hidratação"
                            current={1200}
                            goal={2400}
                            unit="ml"
                        />
                    </Link>

                    <Link to="/exercicio" className="habit-card-link">
                        <HabitCard 
                            Icon={Dumbbell} 
                            title="Exercício"
                            current={15}
                            goal={30}
                            unit=" min"
                        />
                    </Link>

                    <Link to="/dashboard" className="habit-card-link">
                        <HabitCard 
                            Icon={Bed} 
                            title="Sono"
                            current={6}
                            goal={8}
                            unit=" horas"
                        />
                    </Link>

                    <Link to="/dashboard" className="habit-card-link">
                        <HabitCard 
                            Icon={Brain} 
                            title="Meditação"
                            current={5}
                            goal={10}
                            unit=" min"
                        />
                    </Link>

                    <Link to="/dashboard" className="habit-card-link">
                        <HabitCard 
                            Icon={Utensils} 
                            title="Alimentação"
                            current={1}
                            goal={3}
                            unit=" un"
                        />
                    </Link>

                    <Link to="/dashboard" className="habit-card-link">
                        <HabitCard 
                            Icon={BookOpen} 
                            title="Estudo"
                            current={6}
                            goal={8}
                            unit=" horas"
                        />
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;