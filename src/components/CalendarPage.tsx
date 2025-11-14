import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

// Estilos de layout e específicos
import '../styles/App.css';
import '../styles/CalendarPage.css'; 

// --- 1. CONFIGURAÇÃO DE DADOS ---

// Estrutura de tipos para garantir a segurança do TypeScript
type DailyProgressItem = { name: string; progress: number; };

// Dados Mapeados por Dia (Simulação de API)
const dailyDataMap: Record<number, { data: DailyProgressItem[] }> = {
    5: { // Dados para o dia 5 (100% em tudo)
        data: [
            { name: "Hidratação", progress: 100 },
            { name: "Exercício", progress: 100 },
            { name: "Meditação", progress: 100 },
            { name: "Alimentação", progress: 100 },
            { name: "Sono", progress: 100 },
            { name: "Estudo", progress: 100 },
        ]
    },
    6: { // Dados para o dia 6 (100% em tudo)
        data: [
            { name: "Hidratação", progress: 100 },
            { name: "Exercício", progress: 100 },
            { name: "Meditação", progress: 100 },
            { name: "Alimentação", progress: 100 },
            { name: "Sono", progress: 100 },
            { name: "Estudo", progress: 100 },
        ]
    },
    7: { // Dados para o dia 7 (REVERTIDO para os valores iniciais)
        data: [
            { name: "Hidratação", progress: 70 },
            { name: "Exercício", progress: 0 },
            { name: "Meditação", progress: 100 },
            { name: "Alimentação", progress: 75 },
            { name: "Sono", progress: 90 },
            { name: "Estudo", progress: 20 },
        ]
    },
    8: { // Dados para o dia 8 (Exemplo de dia diferente - mantido)
        data: [
            { name: "Hidratação", progress: 95 },
            { name: "Exercício", progress: 60 },
            { name: "Meditação", progress: 0 },
            { name: "Alimentação", progress: 50 },
            { name: "Sono", progress: 70 },
            { name: "Estudo", progress: 85 },
        ]
    },
    9: { // Dados para o dia 9 (Exemplo de dia diferente - mantido)
        data: [
            { name: "Hidratação", progress: 50 },
            { name: "Exercício", progress: 100 },
            { name: "Meditação", progress: 50 },
            { name: "Alimentação", progress: 90 },
            { name: "Sono", progress: 80 },
            { name: "Estudo", progress: 10 },
        ]
    },
    // Você pode adicionar mais dias aqui
};


// Dados visuais do Calendário
const daysData = [
    { num: 26, month: 'other', highlight: 'none' }, { num: 27, month: 'other', highlight: 'none' }, { num: 28, month: 'other', highlight: 'none' },
    { num: 29, month: 'other', highlight: 'none' }, { num: 30, month: 'other', highlight: 'none' }, { num: 31, month: 'other', highlight: 'none' },
    { num: 1, month: 'current', highlight: 'red' }, 
    { num: 2, month: 'current', highlight: 'yellow' }, { num: 3, month: 'current', highlight: 'green' }, 
    { num: 4, month: 'current', highlight: 'yellow' }, { num: 5, month: 'current', highlight: 'green' }, // Dia 5 visualmente verde
    { num: 6, month: 'current', highlight: 'green' }, // Dia 6 visualmente verde
    { num: 7, month: 'current', highlight: 'yellow', isToday: true }, // Dia 7 visualmente amarelo (é 'hoje')
    { num: 8, month: 'current', highlight: 'none' },
    { num: 9, month: 'current', highlight: 'none' }, { num: 10, month: 'current', highlight: 'none' }, { num: 11, month: 'current', highlight: 'none' },
    { num: 12, month: 'current', highlight: 'none' }, { num: 13, month: 'current', highlight: 'none' }, { num: 14, month: 'current', highlight: 'none' },
    { num: 15, month: 'current', highlight: 'none' }, { num: 16, month: 'current', highlight: 'none' }, { num: 17, month: 'current', highlight: 'none' },
    { num: 18, month: 'current', highlight: 'none' }, { num: 19, month: 'current', highlight: 'none' }, { num: 20, month: 'current', highlight: 'none' },
    { num: 21, month: 'current', highlight: 'none' }, { num: 22, month: 'current', highlight: 'none' }, { num: 23, month: 'current', highlight: 'none' },
    { num: 24, month: 'current', highlight: 'none' }, { num: 25, month: 'current', highlight: 'none' }, { num: 26, month: 'current', highlight: 'none' },
    { num: 27, month: 'current', highlight: 'none' }, { num: 28, month: 'current', highlight: 'none' }, { num: 29, month: 'current', highlight: 'none' },
    { num: 30, month: 'current', highlight: 'none' }, 
    { num: 1, month: 'other', highlight: 'none' }, { num: 2, month: 'other', highlight: 'none' }, { num: 3, month: 'other', highlight: 'none' },
    { num: 4, month: 'other', highlight: 'none' }, { num: 5, month: 'other', highlight: 'none' }, { num: 6, month: 'other', highlight: 'none' },
];
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// --- 2. COMPONENTE DE DETALHE DINÂMICO ---

const DailyProgressDetail: React.FC<{ day: number }> = ({ day }) => {
    // Busca os dados no mapa usando o número do dia. Usa o dia 7 como fallback.
    const currentData = dailyDataMap[day as keyof typeof dailyDataMap];
    // Se não encontrar dados para o dia (currentData é undefined), usa dados default (do dia 7 original).
    const dataToDisplay = currentData ? currentData.data : dailyDataMap[7].data;

    // Calcula a média de progresso
    const totalProgress = dataToDisplay.length > 0 ? dataToDisplay.reduce((sum, item) => sum + item.progress, 0) / dataToDisplay.length : 0;

    return (
        <>
            <div className="calendar-summary-header">
                <h3>{day} de Novembro de 2025</h3>
            </div>
            <div className="calendar-summary-body">
                {dataToDisplay.map((item, index) => (
                    <div key={index} className="calendar-stat-item">
                        <span>{item.name}:</span>
                        <span className="progress-value">{item.progress}%</span>
                    </div>
                ))}
            </div>
            <div className="calendar-summary-footer">
                <strong>Total:</strong>
                <strong className="total-progress-value">{totalProgress.toFixed(0)}%</strong>
            </div>
        </>
    );
};

// --- 3. COMPONENTE PRINCIPAL ---

const CalendarPage: React.FC = () => {
    // ESTADO: rastreia o dia selecionado (padrão é o dia 7)
    const [selectedDate, setSelectedDate] = useState<number | null>(7); 
  
    const handleDayClick = (dayNum: number, month: string) => {
        // Apenas permite clicar em dias do mês atual
        if (month === 'current') {
            setSelectedDate(dayNum);
        }
        // Nota: A lógica de fallback no DailyProgressDetail garante que
        // se um dia sem dados for clicado, ele exibe os dados do dia 7.
    };

    const getDayClassName = (day: (typeof daysData)[0]) => {
        let classNames = ['cal-day']; 
        
        if (day.month === 'other') classNames.push('cal-day-other-month');
        if (day.highlight === 'red') classNames.push('cal-day-highlight-red');
        if (day.highlight === 'yellow') classNames.push('cal-day-highlight-yellow');
        if (day.highlight === 'green') classNames.push('cal-day-highlight-green');
        if (day.isToday) classNames.push('cal-day-today');
        
        // Adiciona a classe de 'selecionado' para o dia clicado
        if (day.num === selectedDate && day.month === 'current') classNames.push('calendar-day-selected');
        
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
                            <h1>Calendário</h1>
                            <p>Acompanhe seu desempenho mensal:</p>
                        </header>

                        <div className="calendar-main-content">
                            {/* Coluna Esquerda: Calendário */}
                            <div className="calendar-widget-container">
                                <div className="calendar-widget-header">
                                    <button className="calendar-nav-button">&lt;</button>
                                    <h2>Novembro 2025</h2>
                                    <button className="calendar-nav-button">&gt;</button>
                                </div>
                                <div className="calendar-widget-grid">
                                    {weekDays.map((dayName) => (
                                        <div key={dayName} className="cal-day-header">
                                            {dayName}
                                        </div>
                                    ))}
                                    {daysData.map((day, index) => (
                                        <div 
                                            key={index} 
                                            className={getDayClassName(day)}
                                            onClick={() => handleDayClick(day.num, day.month)}
                                        >
                                            {day.num}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Coluna Direita: Card de Resumo (DINÂMICO) */}
                            <div className="calendar-summary-card">
                                {selectedDate && <DailyProgressDetail day={selectedDate} />}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CalendarPage;