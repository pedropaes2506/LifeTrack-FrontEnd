import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import EditGoalModal from './EditGoalModal';
import { useAuth, API_BASE_URL } from '../context/AuthContext'; // ⬅️ Importa API_BASE_URL
import { getIcon } from '../utils/Icons'; // ⬅️ Importa getIcon do local correto
import '../styles/App.css';
import '../styles/ActivityPage.css';

import { 
    CalendarDays, Clock, 
    CalendarCheck, 
    CalendarX,
    Undo,
    Save, 
} from 'lucide-react';

// ⬅️ Novo tipo de dado baseado na estrutura esperada do backend
interface ActivityData {
    adesaoId: number;
    title: string;
    unit: string;
    goal: number;
    current: number; // Progresso atual no dia
    addButtons: number[];
    // Registros MOCK para o histórico do dia (seria um array de objetos)
    registrosDia: { time: string; value: number }[]; 
    // Histórico MOCK de cumprimento de metas em dias passados
    historicoMetas: { date: string; percentage: number }[]; 
}

// ⬅️ Derivar URL privada da base URL
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
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // Para mensagens de sucesso

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
        
        try {
            const response = await fetch(`${API_PRIVATE_URL}/rotinas/adesao/${adesaoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                // Mapeamento dos dados do backend para o formato do frontend (ActivityData)
                const mappedData: ActivityData = {
                    adesaoId: result.adesaoId,
                    title: result.nome,
                    unit: result.unidade,
                    goal: result.meta,
                    current: result.current, // Valor atual de consumo no dia (supondo que o backend calcula)
                    addButtons: result.addButtons || [50, 100, 250], // Simulação de botões de consumo rápido
                    registrosDia: result.registrosDia || [], // Mock de histórico do dia
                    historicoMetas: result.historicoMetas || [], // Mock de histórico de metas
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
        // Não recarregamos loadData aqui, pois handleSaveGoal faz isso no sucesso
    };
    
    // LÓGICA DE API: Salva a nova meta no backend
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
                // Atualiza localmente e recarrega os dados para pegar o novo 'current' (provavelmente 0)
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
        // Permite ir além da meta, mas a barra de progresso só mostra até 100%
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
    
    // LÓGICA DE API: Salva o progresso atual no backend
    const handleSaveChanges = async () => {
        if (!data || !token || !adesaoId) return;
        
        setError(null);
        setSuccessMessage(null);
        
        try {
            const response = await fetch(`${API_PRIVATE_URL}/registros/registrar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    adesaoId: parseInt(adesaoId),
                    valorConsumido: displayCurrent, // O valor total do dia
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                // Sucesso: Atualiza o estado da aplicação e recarrega para sincronizar
                setSuccessMessage("Progresso salvo com sucesso!");
                loadData(); // Recarrega os dados para resetar o undoStack e atualizar o histórico
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
                    </div>
                </main>
            </div>
        );
    }
    
    // Se o carregamento terminou e deu erro ou não há dados
    if (error || !data) {
        return (
            <div className="dashboard-layout">
                <Header />
                <Sidebar />
                <main className="dashboard-main-content">
                    <div className="hydration-header">
                        <h2 className='text-red-500'>Erro ao carregar Rotina</h2>
                        <p>{error}</p>
                    </div>
                </main>
            </div>
        );
    }

    // Usando as propriedades do objeto 'data'
    const { title, unit, goal, addButtons, registrosDia, historicoMetas } = data;
    const isChanged = data.current !== displayCurrent;
    const Icon = getIcon(title); // Obtém o ícone dinamicamente pelo nome da rotina

    const percentage = goal > 0 ? Math.round((displayCurrent / goal) * 100) : 0;
    const circumference = 314; 
    // Garante que o progresso não vá além de 100% no visual
    const visualPercentage = Math.min(percentage, 100); 
    const progressOffset = circumference * (1 - (visualPercentage / 100));

    // Obtendo o ícone correto para o botão de consumo
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
                        {/* Conteúdo de Histórico (AGORA VINCULADO AO MOCK QUE VIRÁ DO BACKEND) */}
                        <div className="history-grid">
                            
                            <div className="history-column">
                                <h4 className='text-sm font-semibold opacity-70 mb-2'>Registros do Dia</h4>
                                {registrosDia.length === 0 ? (
                                    <p className='text-sm opacity-60'>Nenhum registro hoje.</p>
                                ) : (
                                    registrosDia.map((item, index) => (
                                        <div 
                                            key={item.time + index} 
                                            className="history-item"
                                        >
                                            <Clock size={18} /> {item.time} - {item.value} {unit}
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="history-column">
                                <h4 className='text-sm font-semibold opacity-70 mb-2'>Metas Anteriores</h4>
                                {historicoMetas.length === 0 ? (
                                    <p className='text-sm opacity-60'>Nenhum histórico.</p>
                                ) : (
                                    historicoMetas.map((item) => (
                                        <div key={item.date} className="history-item">
                                            {item.percentage >= 100 ? (
                                                <CalendarCheck size={18} className='text-green-600'/>
                                            ) : (
                                                <CalendarX size={18} className='text-red-600'/>
                                            )}
                                            {item.date} 
                                            <span className="percentage">
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    ))
                                )}
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
                    rotinaId={adesaoId!}
                />
            )}
        </div>
    );
};

export default ActivityPage;