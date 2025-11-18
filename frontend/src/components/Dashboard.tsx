import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; 
import Header from './Header';
import Sidebar from './Sidebar';
import HabitCard from './HabitCard';
import AddHabitModal from './AddHabitModal'; // Importa o modal de adição
import { useAuth, API_BASE_URL } from '../context/AuthContext'; // ⬅️ CORREÇÃO: Importar API_BASE_URL
import { getIcon } from '../utils/icons'; // Importa a função de mapeamento de ícones
import '../styles/App.css';
import '../styles/Dashboard.css'; 
import { Plus, LogOut } from 'lucide-react'; 

// Define o tipo para a rotina do usuário (Minhas Rotinas)
interface MinhaRotina {
    adesaoId: number;
    nome: string;
    meta: number;
    unidade: string;
    current: number; // Valor atual do cumprimento (simulado por enquanto)
    streak: number;  // Contagem de dias consecutivos (simulado por enquanto)
}

// ⬅️ CORREÇÃO: Derivar URL privada da base URL
const API_PRIVATE_URL = API_BASE_URL.replace('/public', '/private'); 

const DashboardPage: React.FC = () => {
    const { user, logout, token } = useAuth();
    const [minhasRotinas, setMinhasRotinas] = useState<MinhaRotina[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const firstName = user?.nome ? user.nome.split(' ')[0] : 'usuário'; 

    const fetchMinhasRotinas = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Chamada API para buscar rotinas do usuário
            // ⬅️ CORREÇÃO: Usar a URL privada construída
            const response = await fetch(`${API_PRIVATE_URL}/rotinas/minhas`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Converte adesaoId para string para uso no roteamento
                const rotinas = data.map((r: any) => ({
                    ...r,
                    adesaoId: r.adesaoId.toString()
                }));
                setMinhasRotinas(rotinas);
            } else {
                console.error("Erro ao carregar rotinas do usuário:", data.message);
                setMinhasRotinas([]); 
            }
        } catch (err) {
            console.error("Erro de rede ao buscar rotinas:", err);
            setMinhasRotinas([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMinhasRotinas();
    }, [fetchMinhasRotinas]);

    // Função para fechar o modal e recarregar a lista (chamada após o sucesso no modal)
    const handleCloseModal = () => {
        setIsModalOpen(false);
        fetchMinhasRotinas(); // Garante o refresh dos hábitos após fechar
    };


    return (
        <div className="dashboard-layout">
            <Header />
            
            <Sidebar />
            
            <main className="dashboard-main-content">
                <div className="dashboard-header">
                    <h2>Olá, {firstName}!</h2>
                    <p>Aqui está o resumo do seu dia:</p>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-600">Carregando seus hábitos...</div>
                ) : minhasRotinas.length === 0 ? (
                    // Se não houver rotinas, exibe o botão grande de adição
                    <div className="flex justify-center items-center h-40">
                        <button 
                            className="bg-gray-200 hover:bg-gray-300 transition-all rounded-xl p-8 shadow-md"
                            onClick={() => setIsModalOpen(true)}
                            style={{ width: '250px', height: '100px' }}
                        >
                            <Plus size={36} className="text-gray-600 mx-auto" />
                        </button>
                    </div>
                ) : (
                    // Se houver rotinas, exibe o grid de HabitCard
                    <div className="habit-grid">
                        {minhasRotinas.map((rotina) => {
                            const Icon = getIcon(rotina.nome);
                            // Link dinâmico para a página de detalhes da rotina usando adesaoId
                            return (
                                <Link key={rotina.adesaoId} to={`/rotina/${rotina.adesaoId}`} className="habit-card-link">
                                    <HabitCard 
                                        Icon={Icon} 
                                        title={rotina.nome}
                                        current={rotina.current}
                                        goal={rotina.meta}
                                        unit={rotina.unidade.toLowerCase()}
                                    />
                                </Link>
                            );
                        })}
                        {/* Botão pequeno para adicionar mais rotinas */}
                        <div className="habit-card" onClick={() => setIsModalOpen(true)} style={{cursor: 'pointer'}}>
                            <div className="habit-icon">
                                <Plus size={32} />
                            </div>
                            <div className="habit-info">
                                <span className="habit-title">Adicionar Novo Hábito</span>
                                <span className="habit-progress">Clique para expandir o seu LifeTrack</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Linha divisória horizontal */}
                <div style={{ marginTop: '2rem', borderTop: '2px solid var(--color-highlight-bg)' }}></div>
                
                {/* Botão de Logout */}
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

            {/* Modal de Adição de Hábito */}
            <AddHabitModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onHabitAdded={fetchMinhasRotinas} 
            />
        </div>
    );
};

export default DashboardPage;