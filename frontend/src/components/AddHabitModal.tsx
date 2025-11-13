import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext'; // ⬅️ CORREÇÃO: Importar API_BASE_URL
import '../styles/App.css'; // Importa estilos base para botões e cores

interface RotinaDisponivel {
    id: number;
    nome: string;
    metaValorPadrao: number | null;
    tipoUnidade: string;
}

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHabitAdded: () => void; // Para forçar o recarregamento do dashboard
}

// ⬅️ CORREÇÃO: Derivar URL privada da base URL
const API_PRIVATE_URL = API_BASE_URL.replace('/public', '/private'); 

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onHabitAdded }) => {
    if (!isOpen) return null;

    const { token } = useAuth();
    const [availableRotinas, setAvailableRotinas] = useState<RotinaDisponivel[]>([]);
    const [selectedRotinas, setSelectedRotinas] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Mapeamento de nomes de rotina para suas metas padrão.
    // Usaremos a meta padrão do DB no envio para simplificar a UI.
    const rotinaMap = availableRotinas.reduce((acc, rotina) => {
        acc[rotina.id] = rotina;
        return acc;
    }, {} as { [key: number]: RotinaDisponivel });


    useEffect(() => {
        if (!isOpen || !token) return;

        // Limpa estados ao abrir
        setSelectedRotinas([]);
        setError(null);
        setSuccessMessage(null);

        const fetchRotinas = async () => {
            setLoading(true);
            try {
                // Rota para buscar rotinas disponíveis
                // ⬅️ CORREÇÃO: Usar a URL privada construída
                const response = await fetch(`${API_PRIVATE_URL}/rotinas/disponiveis`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                if (response.ok) {
                    setAvailableRotinas(data);
                } else {
                    setError(data.message || "Erro ao carregar rotinas disponíveis.");
                }
            } catch (err) {
                setError("Erro de rede ao buscar rotinas.");
            } finally {
                setLoading(false);
            }
        };

        fetchRotinas();
    }, [isOpen, token]);

    const handleToggleSelect = (rotinaId: number) => {
        setSelectedRotinas(prev => 
            prev.includes(rotinaId)
                ? prev.filter(id => id !== rotinaId)
                : [...prev, rotinaId]
        );
    };

    const handleSalvar = async () => {
        if (selectedRotinas.length === 0) {
            setError("Selecione pelo menos um hábito para adicionar.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        let successCount = 0;
        let failedMessages: string[] = [];

        // Itera sobre todas as rotinas selecionadas e envia uma requisição para cada
        for (const rotinaId of selectedRotinas) {
            const rotina = rotinaMap[rotinaId];
            if (!rotina) continue;

            const meta = rotina.metaValorPadrao || 1; // Usa a meta padrão ou 1 se for nula

            try {
                // ⬅️ CORREÇÃO: Usar a URL privada construída
                const response = await fetch(`${API_PRIVATE_URL}/rotinas/aderir`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ rotinaId, metaPessoalValor: meta })
                });
                const data = await response.json();

                if (response.ok) {
                    successCount++;
                } else {
                    failedMessages.push(`Falha ao adicionar ${rotina.nome}: ${data.message}`);
                }
            } catch (err) {
                failedMessages.push(`Falha de rede ao adicionar ${rotina.nome}.`);
            }
        }

        setLoading(false);

        if (successCount > 0) {
            setSuccessMessage(`${successCount} hábito(s) adicionado(s) com sucesso!`);
            onHabitAdded(); // Notifica o dashboard para recarregar
            
            // Fecha o modal após o sucesso
            setTimeout(() => onClose(), 1500); 

        } else if (failedMessages.length > 0) {
            setError(failedMessages.join('\n'));
        }
    };
    
    // Função para renderizar o ícone de marcação (Checkmark ou Vazio)
    const renderCheckbox = (rotinaId: number) => {
        const isSelected = selectedRotinas.includes(rotinaId);
        return (
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                isSelected ? 'bg-white border-white' : 'border-gray-400'
            }`}>
                {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="#5d57a6" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                )}
            </div>
        );
    };


    // Estilos internos adaptados para o seu tema roxo
    const modalStyle = {
        backgroundColor: 'var(--color-primary-dark)', // Roxo escuro
        color: 'var(--color-text-light)', // Texto claro
        borderRadius: '1rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    };
    const buttonCancelStyle = {
        backgroundColor: 'var(--color-secondary-button)', // Roxo mais claro para Cancelar
        color: 'var(--color-text-light)',
    };
    const buttonSaveStyle = {
        backgroundColor: 'var(--color-secondary-button)', // Roxo mais claro para Salvar
        color: 'var(--color-text-light)',
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div style={modalStyle}>
                <h3 className="text-2xl font-bold mb-6 text-center">Adicionar Hábito(s):</h3>

                {loading && <p className="text-center text-gray-300">Carregando rotinas disponíveis...</p>}
                
                {error && <p className="text-center text-red-300 mb-4">{error}</p>}
                {successMessage && <p className="text-center text-green-300 font-medium mb-4">{successMessage}</p>}
                
                {!loading && availableRotinas.length === 0 && !error && (
                    <p className="text-center text-gray-300">Todas as rotinas disponíveis já foram adicionadas!</p>
                )}

                <div className="space-y-4 max-h-72 overflow-y-auto pr-4">
                    {availableRotinas.map((rotina) => (
                        <div 
                            key={rotina.id} 
                            className="flex items-center justify-between cursor-pointer py-1"
                            onClick={() => handleToggleSelect(rotina.id)}
                        >
                            <div className="flex items-center gap-4">
                                {renderCheckbox(rotina.id)}
                                <p className="text-lg">{rotina.nome}</p>
                            </div>
                            <span className="text-sm opacity-70">
                                Meta Padrão: {rotina.metaValorPadrao} {rotina.tipoUnidade.toLowerCase()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between gap-4 mt-6">
                    <button 
                        onClick={onClose} 
                        style={buttonCancelStyle}
                        className="button-base w-full py-3"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSalvar}
                        style={buttonSaveStyle}
                        className="button-base w-full py-3"
                        disabled={loading || selectedRotinas.length === 0}
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddHabitModal;