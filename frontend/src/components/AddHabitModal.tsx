import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext'; 
import '../styles/App.css'; 
import '../styles/AddHabitModal.css'; 

interface RotinaDisponivel {
    id: number;
    nome: string;
    metaValorPadrao: number | null;
    tipoUnidade: string;
}

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHabitAdded: () => void;
}

// Derivar URL privada da base URL
const API_PRIVATE_URL = API_BASE_URL.replace('/public', '/private'); 

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onHabitAdded }) => {
    if (!isOpen) return null;

    const { token } = useAuth();
    const [availableRotinas, setAvailableRotinas] = useState<RotinaDisponivel[]>([]);
    const [selectedRotinas, setSelectedRotinas] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Mapeamento de rotinas.
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
            <div className={`custom-checkbox ${isSelected ? 'selected' : ''}`}>
                {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                )}
            </div>
        );
    };

    return (
        <div className="add-modal-backdrop" onClick={onClose}>
            <div className="add-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-6 text-center">Adicionar Hábito(s):</h3>

                {loading && <p className="text-center">Carregando rotinas disponíveis...</p>}
                
                {error && <p className="text-center text-error mb-4 whitespace-pre-line">{error}</p>}
                {successMessage && <p className="text-center text-success font-medium mb-4">{successMessage}</p>}
                
                {!loading && availableRotinas.length === 0 && !error && (
                    <p className="text-center opacity-70">Todas as rotinas disponíveis já foram adicionadas!</p>
                )}

                <div className="available-rotinas-list">
                    {availableRotinas.map((rotina) => (
                        <div 
                            key={rotina.id} 
                            className="rotina-item"
                            onClick={() => handleToggleSelect(rotina.id)}
                        >
                            <div className="rotina-info">
                                {renderCheckbox(rotina.id)}
                                <p className="text-lg">{rotina.nome}</p>
                            </div>
                            <span className="rotina-meta-padrao">
                                Meta Padrão: {rotina.metaValorPadrao} {rotina.tipoUnidade.toLowerCase()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="add-modal-actions">
                    <button 
                        onClick={onClose} 
                        className="button-base button-secondary-bg"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSalvar}
                        className="button-base button-secondary-bg"
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