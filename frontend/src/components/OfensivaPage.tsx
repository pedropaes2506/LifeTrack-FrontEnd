import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header'; 
import Sidebar from './Sidebar';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

import '../styles/App.css';
import '../styles/OfensivaPage.css';

const API_PRIVATE_URL = API_BASE_URL.replace('/public', '/private');

interface StreakSummary {
    count: number;
    streakDays: string[]; // Array de datas no formato 'YYYY-MM-DD'
}

interface CalendarDay {
    date: Date;
    dayNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
}

const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const numDaysInMonth = lastDayOfMonth.getDate();
    
    const startWeekDay = firstDayOfMonth.getDay(); 
    const prevMonthDays = [];
    if (startWeekDay > 0) {
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startWeekDay - 1; i >= 0; i--) {
            prevMonthDays.push({ 
                date: new Date(year, month - 1, prevMonthLastDay - i),
                dayNum: prevMonthLastDay - i, 
                isCurrentMonth: false, 
                isToday: false 
            });
        }
    }
    
    const currentMonthDays = [];
    for (let i = 1; i <= numDaysInMonth; i++) {
        const dayDate = new Date(year, month, i);
        dayDate.setHours(0, 0, 0, 0);
        const isToday = dayDate.getTime() === today.getTime();
        currentMonthDays.push({ 
            date: dayDate,
            dayNum: i, 
            isCurrentMonth: true, 
            isToday: isToday 
        });
    }

    const allDays = [...prevMonthDays, ...currentMonthDays];
    
    const nextMonthDays = [];
    const remainingSlots = 42 - allDays.length; 
    for (let i = 1; i <= remainingSlots; i++) {
        nextMonthDays.push({ 
            date: new Date(year, month + 1, i),
            dayNum: i, 
            isCurrentMonth: false, 
            isToday: false 
        });
    }
    
    return [...allDays, ...nextMonthDays].slice(0, 42);
};

const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const OfensivaPage: React.FC = () => {
    const { token } = useAuth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [dataAtual, setDataAtual] = useState(new Date(today.getFullYear(), today.getMonth(), 1)); 
    const [streakData, setStreakData] = useState<StreakSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const daysData = getDaysInMonth(dataAtual);
    const monthYearString = dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const fetchStreakSummary = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_PRIVATE_URL}/progress/streak-summary`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            
            if (response.ok) {
                setStreakData(data);
            } else {
                setError(data.message || "Erro ao carregar resumo da ofensiva.");
                setStreakData({ count: 0, streakDays: [] });
            }
        } catch (e) {
            setError("Erro de rede ao buscar dados da ofensiva.");
            setStreakData({ count: 0, streakDays: [] });
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchStreakSummary();
    }, [fetchStreakSummary]);


    const handleMonthChange = (offset: number) => {
        setDataAtual(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    const getDayClassName = (day: CalendarDay) => {
        let classNames = ['ofensiva-day'];
        
        if (!day.isCurrentMonth) {
            classNames.push('ofensiva-day-other-month');
        } else {
            const dateKey = formatDateToISO(day.date);
            
            // Verifica se este dia está na lista de dias da ofensiva ativa (incluindo verde ou amarelo)
            if (streakData?.streakDays.includes(dateKey)) {
                classNames.push('ofensiva-day-highlight-blue');
            }
            
            // Adiciona destaque de "hoje"
            if (day.isToday) {
                 classNames.push('ofensiva-day-today');
            }
        }
        
        return classNames.join(' ');
    };

    return (
        <div className="app-container">
            <Header />
            <div className="app-body-layout">
                <Sidebar />

                <main className="app-content-area">
                    <div className="ofensiva-page-container">
                        <header className="ofensiva-page-header">
                            <div className="ofensiva-page-title-group">
                                <h1>Ofensiva</h1>
                                <p>Acompanhe sua ofensiva:</p>
                            </div>
                        </header>

                        <div className="ofensiva-main-content">
                            <div className="ofensiva-widget-container">
                                
                                {error && (
                                    <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
                                        Erro ao carregar ofensiva: {error}
                                    </div>
                                )}
                                
                                {/* Card de ofensiva DINÂMICO */}
                                <div className="ofensiva-days-card">
                                    <Flame size={25} />
                                    {loading ? (
                                        <span>Carregando...</span>
                                    ) : (
                                        // Contagem dinâmica
                                        <span>{streakData?.count || 0} dia(s) de ofensiva</span> 
                                    )}
                                </div>

                                <div className="ofensiva-widget-header">
                                    <button 
                                        className="ofensiva-nav-button"
                                        onClick={() => handleMonthChange(-1)}
                                        disabled={loading}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <h2>{monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1)}</h2>
                                    <button 
                                        className="ofensiva-nav-button"
                                        onClick={() => handleMonthChange(1)}
                                        disabled={loading}
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                                <div className="ofensiva-widget-grid">
                                    {weekDays.map((dayName) => (
                                        <div key={dayName} className="ofensiva-day-header">
                                            {dayName}
                                        </div>
                                    ))}
                                    {daysData.map((day, index) => (
                                        <div 
                                            key={index} 
                                            className={getDayClassName(day)}
                                        >
                                            {day.dayNum}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OfensivaPage;