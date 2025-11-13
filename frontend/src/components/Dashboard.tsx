import React from 'react';
import { Link } from 'react-router-dom'; 
import Header from './Header';
import Sidebar from './Sidebar';
import HabitCard from './HabitCard';
import { useAuth } from '../context/AuthContext'; // Importando useAuth
import '../styles/App.css';
import '../styles/Dashboard.css'; 

import { Droplet, Dumbbell, Bed, Brain, Utensils, BookOpen, LogOut } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth(); // Obtendo usuário e função de logout

    // LÓGICA ATUALIZADA: Extrai o primeiro nome.
    // Se user.nome existir, divide a string pelo espaço e pega o primeiro elemento.
    const firstName = user?.nome ? user.nome.split(' ')[0] : 'usuário'; 

    return (
        <div className="dashboard-layout">
            <Header />
            
            <Sidebar />
            
            <main className="dashboard-main-content">
                <div className="dashboard-header">
                    <h2>Olá, {firstName}!</h2>
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
                
                {/* Botão de Logout adicionado ao Dashboard */}
                <div style={{ padding: '2rem 2rem', textAlign: 'center' }}>
                    <button 
                        onClick={logout} 
                        className="button-base button-secondary-bg"
                        style={{ display: 'flex', alignItems: 'center', margin: '0 auto', gap: '0.5rem' }}
                    >
                        <LogOut size={20} /> Sair da conta
                    </button>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;