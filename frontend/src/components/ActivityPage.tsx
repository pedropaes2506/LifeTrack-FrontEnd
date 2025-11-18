import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import EditGoalModal from './EditGoalModal';
import { useAuth, API_BASE_URL } from '../context/AuthContext'; 
import { getIcon } from '../utils/icons'; 
import '../styles/App.css';
import '../styles/ActivityPage.css';

import { 
    CalendarDays, Clock, 
    CalendarCheck, 
    CalendarX,
    Undo,
    Save, 
} from 'lucide-react';

// Novo tipo de dado para o Histórico de Metas
interface MetaHistoryItem {
    date: string;
    status: 'Completa' | 'Incompleta';
    isComplete: boolean;
}

// Novo tipo de dado para a página de atividade
interface ActivityData {
    adesaoId: number;
    title: string;
    unit: string;
    goal: number;
    current: number; // Progresso TOTAL do dia (Soma de todos os deltas)
    addButtons: number[];
    registrosDia: { time: string; value: number }[]; // Lista de deltas individuais
    historicoMetas: MetaHistoryItem[]; 
}

// Derivar URL privada da base URL
const API_PRIVATE_URL = API_BASE_URL.replace('/public', '/private'); 

const ActivityPage: React.FC = () => {
    
    const { adesaoId } = useParams<{ adesaoId: string }>(); 
    const { token } = useAuth();
    
    const [data, setData] = useState<ActivityData | null>(null);
    const [displayCurrent, setDisplayCurrent] = useState<number>(0);
    
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [undoStack, setUndoStack] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // FUNÇÃO PARA BUSCAR DETALHES DA ADESÃO NO BACKEND
    const loadData = useCallback(async () => {
        if (!adesaoId || !token) {
            if (!adesaoId) setError("ID da rotina ausente.");
            if (!token) setError("Usuário não autenticado.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            const response = await fetch(`${API_PRIVATE_URL}/rotinas/adesao/${adesaoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                const mappedData: ActivityData = {
                    adesaoId: result.adesaoId,
                    title: result.nome,
                    unit: result.unidade,
                    goal: result.meta,
                    current: result.current, 
                    addButtons: result.addButtons || [100, 200, 300], 
                    registrosDia: result.registrosDia || [], 
                    historicoMetas: result.historicoMetas || [], 
                };
                
                setData(mappedData);
                setDisplayCurrent(mappedData.current); 
            } else {
                setError(result.message || "Rotina não encontrada ou acesso negado.");
            }
        } catch (e) {
            console.error("Erro no carregamento de dados da rotina:", e);
            setError("Erro ao carregar os dados da rotina. Tente novamente.");
        } finally {
            setLoading(false);
            setUndoStack([]); 
        }
    }, [adesaoId, token]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    const handleEditGoal = () => {
        setIsModalOpen(true); 
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    
    const handleSaveGoal = async (newGoal: number) => {
        if (!data || !token) return;
        
        try {
            const response = await fetch(`${API_PRIVATE_URL}/rotinas/meta/${adesaoId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ meta: newGoal })
            });

            const result = await response.json();
            
            if (response.ok) {
                setSuccessMessage("Meta atualizada com sucesso!");
                loadData(); 
            } else {
                setError(result.message || "Erro ao atualizar a meta.");
            }
        } catch (e) {
            setError("Erro de rede ao salvar a meta.");
        }
    };

    // Ações locais (adicionar/remover consumo)
    const handleAddConsumption = (amount: number) => {
        if (!data) return;
        setUndoStack(prevStack => [...prevStack, displayCurrent]);
        setDisplayCurrent(prev => prev + amount); 
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
    
    // LÓGICA DE API: Salva o DELTA (Diferença) como um novo registro
    const handleSaveChanges = async () => {
        if (!data || !token || !adesaoId) return;
        
        setError(null);
        setSuccessMessage(null);
        
        // 1. Calcular o DELTA (a diferença que o usuário quer registrar)
        const deltaConsumido = displayCurrent - data.current; 

        // 2. Verificar se houve alteração antes de salvar
        if (deltaConsumido === 0) {
            setSuccessMessage("Nenhuma alteração a ser salva.");
            return;
        }

        try {
            // Envia o deltaConsumido, que será o valorRegistro no backend
            const response = await fetch(`${API_PRIVATE_URL}/registros/registrar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    adesaoId: parseInt(adesaoId),
                    valorConsumido: deltaConsumido, // Envia o DELTA
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                // Sucesso: Recarrega os dados para que 'data.current' seja sincronizado
                setSuccessMessage("Registro de consumo adicionado com sucesso!");
                loadData(); 
            } else {
                setError(result.message || "Erro ao salvar o progresso.");
            }
        } catch (e) {
            setError("Erro de rede ao salvar o progresso.");
        }
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Header />
                <Sidebar />
                <main className="dashboard-main-content">
                    <div className="hydration-header">
                        <h2>Carregando detalhes da rotina...</h2>
                        <p>ID da Adesão: {adesaoId}</p>
                    </div>
                </main>
            </div>
        );
    }
    
    if (error || !data) {
        return (
            <div className="dashboard-layout">
                <Header />
                <Sidebar />
                <main className="dashboard-main-content">
                    <div className="hydration-header">
                        <h2 style={{ color: 'red' }}>Erro ao carregar Rotina</h2>
                        <p>{error}</p>
                    </div>
                </main>
            </div>
        );
    }

    const { title, unit, goal, addButtons, registrosDia, historicoMetas } = data;
    const hasPendingChanges = displayCurrent !== data.current; 
    const Icon = getIcon(title); 

    const percentage = goal > 0 ? Math.round((displayCurrent / goal) * 100) : 0;
    const circumference = 314; 
    const visualPercentage = Math.min(percentage, 100); 
    const progressOffset = circumference * (1 - (visualPercentage / 100));

    const ConsumptionIcon = Icon;

    return (
        <div className="dashboard-layout">
            <Header />
            
            <Sidebar />
            
            <main className="dashboard-main-content">
                <div className="hydration-header"> 
                    <h2>{title}</h2> 
                    <p>
                        <CalendarDays size={18} />
                        Acompanhe seu progresso em: <strong>{new Date().toLocaleDateString('pt-BR')}</strong>
                    </p>
                </div>
                
                {/* Mensagens de feedback */}
                {(error || successMessage) && (
                    <div className={`p-4 mx-8 rounded-lg mb-4 text-center ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {error || successMessage}
                    </div>
                )}

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
                                {visualPercentage}% 
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
                                disabled={!hasPendingChanges} // Desabilita se não houver delta
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
                                    <ConsumptionIcon size={18} /> +{value} {unit}
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
                                    <ConsumptionIcon size={18} /> -{value} {unit}
                                </button>
                            ))}
                        </div>

                        <h3>Histórico:</h3>
                        <div className="history-grid">
                            
                            <div className="history-column">
                                <h4 className='text-sm font-semibold opacity-70 mb-2'>Registros do Dia</h4>
                                {registrosDia.length === 0 ? (
                                    <p className='text-sm opacity-60'>Nenhum registro hoje.</p>
                                ) : (
                                    // Renderiza o histórico de registros individuais
                                    registrosDia.map((item, index) => (
                                        <div 
                                            key={item.time + item.value + index} 
                                            className="history-item"
                                        >
                                            {/* Formata o valor para mostrar + ou - */}
                                            <Clock size={18} /> {item.time} - {item.value > 0 ? `+${item.value}` : item.value} {unit}
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="history-column">
                                <h4 className='text-sm font-semibold opacity-70 mb-2'>Metas Anteriores</h4>
                                {historicoMetas.length === 0 ? (
                                    <p className='text-sm opacity-60'>Nenhum histórico anterior à adesão.</p>
                                ) : (
                                    historicoMetas.map((item) => (
                                        <div key={item.date} className="history-item">
                                            {item.isComplete ? (
                                                <CalendarCheck size={18} style={{ color: 'var(--color-secondary-button)' }}/>
                                            ) : (
                                                <CalendarX size={18} style={{ color: '#dc2626' }}/>
                                            )}
                                            {item.date} 
                                            <span className={`percentage ${item.isComplete ? 'text-green-500' : 'text-red-500'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {isModalOpen && data && (
                <EditGoalModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveGoal}
                    currentGoal={data.goal}
                    unit={data.unit}
                    rotinaId={adesaoId!}
                />
            )}
        </div>
    );
};

export default ActivityPage;