import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Estilos de layout e específicos
import '../styles/App.css';
import '../styles/CalendarPage.css'; 

const API_PRIVATE_URL = API_BASE_URL.replace('/public', '/private');

interface MonthlySummary {
    [dateKey: string]: { // Chave: 'YYYY-MM-DD'
        status: 'vermelho' | 'amarelo' | 'verde' | 'none';
        totalPorcentagem: number;
    };
}

interface DailyDetail {
    dataSelecionada: string; // Ex: "17 de Novembro de 2025"
    totalPorcentagem: number;
    habitos: { 
        nome: string; 
        porcentagem: number; 
        concluido: boolean; 
    }[];
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

    // Mês atual
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const numDaysInMonth = lastDayOfMonth.getDate();
    
    // Dias do mês anterior
    const startWeekDay = firstDayOfMonth.getDay(); // 0 (Domingo) a 6 (Sábado)
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
    
    // Dias do mês atual
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
    
    // Dias do próximo mês para completar a grade (máximo 6 linhas = 42 células)
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

// Formato usado para a chave do objeto no backend (YYYY-MM-DD)
const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const DailyProgressDetail: React.FC<{ details: DailyDetail | null }> = ({ details }) => {
    
    // 1. Se não houver dados (estado inicial ou antes da seleção)
    if (!details) {
        return (
            <div className="calendar-summary-header p-4 text-center">
                <h3>Selecione um dia no calendário</h3>
            </div>
        );
    }
    
    // 2. Se houver dados, mas nenhuma rotina ativa naquele dia ou nenhum registro
    if (details.habitos.length === 0) {
        return (
            <>
                <div className="calendar-summary-header">
                    <h3>{details.dataSelecionada}</h3>
                </div>
                <div className="p-4 text-center opacity-70">
                    Nenhuma atividade registrada neste dia.
                </div>
            </>
        );
    }
    
    // 3. Renderização com dados (Conforme solicitado)
    return (
        <>
            <div className="calendar-summary-header">
                <h3>{details.dataSelecionada}</h3>
            </div>
            <div className="calendar-summary-body">
                {details.habitos.map((item, index) => (
                    <div key={index} className="calendar-stat-item">
                        <span>{item.nome}:</span>
                        <span className="progress-value">{item.porcentagem}%</span>
                    </div>
                ))}
            </div>
            <div className="calendar-summary-footer">
                <strong>Total:</strong>
                <strong className="total-progress-value">{details.totalPorcentagem}%</strong>
            </div>
        </>
    );
};

const CalendarPage: React.FC = () => {
    const { token } = useAuth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // ESTADOS:
    // Mês atual sendo exibido (o dia é fixo em 1 para facilitar a navegação)
    const [dataAtual, setDataAtual] = useState(new Date(today.getFullYear(), today.getMonth(), 1)); 
    // Data selecionada (padrão é hoje)
    const [selectedDate, setSelectedDate] = useState<Date>(today);
    // Dados para as cores do calendário
    const [dadosMensais, setDadosMensais] = useState<MonthlySummary>({});
    // Dados para o card lateral
    const [detalhesDia, setDetalhesDia] = useState<DailyDetail | null>(null);
    const [loadingMonthly, setLoadingMonthly] = useState(false);
    const [loadingDaily, setLoadingDaily] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const daysData = getDaysInMonth(dataAtual);
    const monthYearString = dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    const fetchMonthlySummary = useCallback(async () => {
        if (!token) return;
        setLoadingMonthly(true);
        setError(null);

        const ano = dataAtual.getFullYear();
        const mes = dataAtual.getMonth() + 1;
        
        try {
            const response = await fetch(`${API_PRIVATE_URL}/calendar/monthly-summary?ano=${ano}&mes=${mes}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            
            if (response.ok) {
                setDadosMensais(data);
            } else {
                setError(data.message || "Erro ao carregar resumo mensal.");
            }
        } catch (e) {
            setError("Erro de rede ao buscar dados do calendário.");
        } finally {
            setLoadingMonthly(false);
        }
    }, [dataAtual, token]);

    const fetchDailyDetail = useCallback(async (date: Date) => {
        if (!token) return;
        setLoadingDaily(true);
        setError(null);

        const dataISO = formatDateToISO(date);
        
        try {
            const response = await fetch(`${API_PRIVATE_URL}/calendar/daily-detail?data=${dataISO}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            
            if (response.ok) {
                setDetalhesDia(data);
            } else {
                setError(data.message || "Erro ao carregar detalhes do dia.");
            }
        } catch (e) {
            setError("Erro de rede ao buscar detalhes do dia.");
        } finally {
            setLoadingDaily(false);
        }
    }, [token]);

    // Efeito: Carrega dados mensais quando o mês de visualização muda
    useEffect(() => {
        fetchMonthlySummary();
    }, [fetchMonthlySummary]);

    // Efeito: Carrega detalhes do dia selecionado
    useEffect(() => {
        // Garantir que a data inicial (hoje) seja carregada na montagem
        if (selectedDate) {
            fetchDailyDetail(selectedDate);
        }
    }, [selectedDate, fetchDailyDetail]);


    const handleMonthChange = (offset: number) => {
        setDataAtual(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
        // Não limpa selectedDate, mas recarrega os dados do novo mês
    };

    const handleDayClick = (day: CalendarDay) => {
        // Permite selecionar apenas dias do mês atual para evitar duplicação de lógica de navegação
        if (!day.isCurrentMonth) return; 

        setSelectedDate(day.date);
        // O useEffect tratará a chamada a fetchDailyDetail
    };

    const getDayClassName = (day: CalendarDay) => {
        let classNames = ['cal-day']; 
        
        // Dias de outros meses
        if (!day.isCurrentMonth) {
            classNames.push('cal-day-other-month');
        } else {
            // Verifica o status de conclusão na data (só funciona para o mês atual no resumo)
            const dateKey = formatDateToISO(day.date);
            const status = dadosMensais[dateKey]?.status || 'none';
            
            if (status === 'vermelho') classNames.push('cal-day-highlight-red');
            if (status === 'amarelo') classNames.push('cal-day-highlight-yellow');
            if (status === 'verde') classNames.push('cal-day-highlight-green');

            // Verifica se está selecionado
            if (selectedDate && day.date.toDateString() === selectedDate.toDateString()) {
                 classNames.push('calendar-day-selected');
            }
        }
        
        if (day.isToday) classNames.push('cal-day-today');

        return classNames.join(' ');
    };


    return (
        <div className="app-container">
            <Header />
            <div className="app-body-layout">
                <Sidebar />
                
                <main className="app-content-area">
                    <div className="calendar-page-container">
                        <header className="calendar-page-header">
                            <h2>Calendário</h2>
                            <p>Acompanhe seu desempenho mensal:</p>
                        </header>
                        
                        {error && (
                            <div className="p-4 bg-red-100 text-red-700 rounded-lg my-4 mx-auto" style={{maxWidth: '800px'}}>
                                Erro: {error}
                            </div>
                        )}

                        <div className="calendar-main-content">
                            {/* Coluna Esquerda: Calendário */}
                            <div className="calendar-widget-container">
                                <div className="calendar-widget-header">
                                    <button 
                                        className="calendar-nav-button" 
                                        onClick={() => handleMonthChange(-1)}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <h2>{monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1)}</h2>
                                    <button 
                                        className="calendar-nav-button" 
                                        onClick={() => handleMonthChange(1)}
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                                <div className="calendar-widget-grid">
                                    {weekDays.map((dayName) => (
                                        <div key={dayName} className="cal-day-header">
                                            {dayName}
                                        </div>
                                    ))}
                                    {loadingMonthly ? (
                                        <div className="text-center p-8 opacity-70 col-span-7">Carregando dados do mês...</div>
                                    ) : (
                                        daysData.map((day, index) => (
                                            <div 
                                                key={index} 
                                                className={getDayClassName(day)}
                                                onClick={() => handleDayClick(day)}
                                                // Desabilita cliques em dias de outros meses
                                                style={{ cursor: day.isCurrentMonth ? 'pointer' : 'default' }}
                                            >
                                                {day.dayNum}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Coluna Direita: Card de Resumo (DINÂMICO) */}
                            <div className="calendar-summary-card">
                                {loadingDaily ? (
                                    <div className="p-4 text-center">Carregando detalhes...</div>
                                ) : (
                                    <DailyProgressDetail details={detalhesDia} />
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CalendarPage;