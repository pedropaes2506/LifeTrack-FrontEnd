import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import EditGoalModal from './EditGoalModal'; 
import '../styles/App.css';
import '../styles/ActivityPage.css'; 
import { fetchActivityData, type ActivityData } from '../api';

import { 
    CalendarDays, Clock, 
    CalendarCheck, 
    CalendarX,
    Undo,
    Save, 
} from 'lucide-react';

const ActivityPage: React.FC = () => {
    
    const { slug } = useParams<{ slug: string }>();
    const [data, setData] = useState<ActivityData | null>(null);
    const [displayCurrent, setDisplayCurrent] = useState<number>(0);
    
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [undoStack, setUndoStack] = useState<number[]>([]);

    useEffect(() => {
        if (slug) {
            const loadData = async () => {
                setData(null); 
                const result = await fetchActivityData(slug);
                setData(result); 
                if (result) {
                    setDisplayCurrent(result.current); 
                }
                setUndoStack([]); 
            };
            loadData();
        }
    }, [slug]);

    const handleEditGoal = () => {
        setIsModalOpen(true); 
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveGoal = (newGoal: number) => {
        if (data) {
            const newData = { ...data, goal: newGoal, current: 0 };
            setData(newData); 
            setDisplayCurrent(0); 
            setUndoStack([]); 
            console.log(`Nova meta salva para ${slug}: ${newGoal}`);
        }
    };

    const handleAddConsumption = (amount: number) => {
        if (!data) return;
        setUndoStack(prevStack => [...prevStack, displayCurrent]);
        setDisplayCurrent(prev => Math.min(prev + amount, data.goal));
    };

    const handleRemoveConsumption = (amount: number) => {
        if (!data) return;
        setUndoStack(prevStack => [...prevStack, displayCurrent]);
        setDisplayCurrent(prev => Math.max(0, prev - amount));
    };

    const handleUndo = () => {
        if (!data || undoStack.length === 0) return; 

        const lastState = undoStack[undoStack.length - 1];
        const newStack = undoStack.slice(0, -1); 

        setDisplayCurrent(lastState);
        setUndoStack(newStack);
    };

    const handleSaveChanges = () => {
        if (!data) return;
        
        setData({ ...data, current: displayCurrent });
        setUndoStack([]); 
        
        console.log(`Salvando progresso no backend: ${displayCurrent}`);
    };

    if (!data) {
        return (
            <div className="dashboard-layout">
                <Header />
                <Sidebar />
                <main className="dashboard-main-content">
                    <div className="hydration-header">
                        <h2>Carregando...</h2>
                    </div>
                </main>
            </div>
        );
    }

    const { title, unit, goal, addButtons, historyTime, historyDate, Icon } = data;
    const isChanged = data.current !== displayCurrent;

    const percentage = goal > 0 ? Math.round((displayCurrent / goal) * 100) : 0;
    const circumference = 314; 
    const progressOffset = circumference * (1 - (percentage / 100));

    return (
        <div className="dashboard-layout">
            <Header />
            
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
                            <span>Progresso: <strong>{displayCurrent} {unit}</strong></span> 
                            <span>Meta: <strong>{goal} {unit}</strong></span> 
                        </div>

                        <div className="progress-buttons-container">
                            <button 
                                className="button-base button-primary-dark edit-goal-btn" 
                                onClick={handleEditGoal}
                            >
                                Editar Meta
                            </button>
                            <button 
                                className="button-base button-secondary-bg save-progress-btn"
                                onClick={handleSaveChanges}
                                disabled={!isChanged}
                            >
                                <Save size={16} /> Salvar Alteração
                            </button>
                        </div>
                    </div>

                    <div className="hydration-divider" />

                    <div className="hydration-actions">
                        <h3>Adicionar consumo:</h3>
                        <div className="consumption-buttons">
                            {addButtons.map((value) => (
                                <button 
                                    key={value} 
                                    className="consumption-btn"
                                    onClick={() => handleAddConsumption(value)}
                                >
                                    <Icon size={18} /> +{value} {unit}
                                </button>
                            ))}
                            <button 
                                className="consumption-btn undo"
                                onClick={handleUndo}
                                disabled={undoStack.length === 0}
                            >
                                <Undo size={18} />
                            </button>
                        </div>

                        <h3>Remover consumo:</h3>
                        <div className="consumption-buttons">
                            {addButtons.map((value) => (
                                <button 
                                    key={value} 
                                    className="consumption-btn remove"
                                    onClick={() => handleRemoveConsumption(value)}
                                >
                                    <Icon size={18} /> -{value} {unit}
                                </button>
                            ))}
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

            {isModalOpen && (
                <EditGoalModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveGoal}
                    currentGoal={data.goal}
                    unit={data.unit}
                />
            )}
        </div>
    );
};

export default ActivityPage;