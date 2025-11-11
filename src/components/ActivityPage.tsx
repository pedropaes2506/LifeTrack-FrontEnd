import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/App.css';
import '../styles/ActivityPage.css'; 

import { 
    Settings, Bell, User, 
    CalendarDays, Clock, Plus, 
    type LucideIcon, 
    CalendarCheck, 
    CalendarX
} from 'lucide-react';

interface ActivityPageProps {
    title: string;
    unit: string;
    current: number;
    goal: number;
    addButtons: number[]; 
    historyTime: { time: string; value: number }[];
    historyDate: { date: string; percentage: number }[];
    AddIcon: LucideIcon; 
}

const ActivityPage: React.FC<ActivityPageProps> = ({
    title,
    unit,
    current,
    goal,
    addButtons,
    historyTime,
    historyDate,
    AddIcon
}) => {
    
    const percentage = Math.round((current / goal) * 100);
    const circumference = 314; 
    const progressOffset = circumference * (1 - (percentage / 100));

    return (
        <div className="dashboard-layout">
            <Header>
                <Settings size={24} />
                <Bell size={24} />
                <User size={24} />
            </Header>
            
            <Sidebar />
            
            <main className="dashboard-main-content">
                <div className="hydration-header"> 
                    <h2>{title}</h2> 
                    <p>
                        <CalendarDays size={18} />
                        Acompanhe seu progresso em: <strong>02/09/2025</strong>
                    </p>
                </div>

                <div className="hydration-body">
                    <div className="hydration-progress">
                        <svg className="progress-donut-svg" viewBox="0 0 120 120">
                            <circle className="donut-track" cx="60" cy="60" r="50" />
                            <circle 
                                className="donut-progress"
                                cx="60" cy="60" r="50"
                                strokeDasharray={circumference}
                                strokeDashoffset={progressOffset} 
                            />
                            <text className="donut-text" x="50%" y="50%" dy=".3em">
                                {percentage}% 
                            </text>
                            <text className="donut-subtext" x="50%" y="65%" dy=".3em">
                                concluído
                            </text>
                        </svg>

                        <div className="progress-stats">
                            <span>Progresso: <strong>{current} {unit}</strong></span> 
                            <span>Meta: <strong>{goal} {unit}</strong></span> 
                        </div>
                    </div>

                    <div className="hydration-divider" />

                    <div className="hydration-actions">
                        <h3>Adicionar consumo:</h3>
                        <div className="consumption-buttons">
                            {addButtons.map((value) => (
                                <button key={value} className="consumption-btn">
                                    <AddIcon size={18} /> +{value} {unit}
                                </button>
                            ))}
                            <button className="consumption-btn plus">
                                <Plus size={18} />
                            </button>
                        </div>

                        <h3>Histórico:</h3>
                        <div className="history-grid">
                            
                            <div className="history-column">
                                {historyTime.map((item, index) => (
                                    <div 
                                        key={item.time} 
                                        className={`history-item ${index === historyTime.length - 1 ? 'highlight' : ''}`}
                                    >
                                        <Clock size={18} /> {item.time} - {item.value} {unit}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="history-column">
                                {historyDate.map((item) => (
                                    <div key={item.date} className="history-item">
                                        {item.percentage >= 100 ? (
                                            <CalendarCheck size={18} />
                                        ) : (
                                            <CalendarX size={18} />
                                        )}
                                        {item.date} 
                                        <span className="percentage">
                                            {item.percentage}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ActivityPage;