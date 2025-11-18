import React, { useState } from 'react';
import '../styles/EditGoalModal.css'; 

interface EditGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentGoal: number;
    unit: string;
    rotinaId: string; // Adicionado para identificar qual Adesão está sendo alterada
    onSave: (newGoal: number) => void;
}

const EditGoalModal: React.FC<EditGoalModalProps> = ({ isOpen, onClose, currentGoal, unit, rotinaId, onSave }) => {
    
    // Inicia o estado da meta com a meta atual
    const [goal, setGoal] = useState(currentGoal);
    const [loading, setLoading] = useState(false);

    if (!isOpen) {
        return null;
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validação básica
        if (goal <= 0) {
             console.error("A meta deve ser um valor positivo.");
             setLoading(false);
             return;
        }

        onSave(goal);
        
        setLoading(false);
        onClose();
    };

    const handleIncrement = () => {
        const step = unit.toLowerCase() === 'ml' ? 100 : 10;
        setGoal(prev => prev + step);
    };

    const handleDecrement = () => {
        const step = unit.toLowerCase() === 'ml' ? 100 : 10;
        setGoal(prev => Math.max(0, prev - step));
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSave}>
                    <h4>Meta de Consumo Diário</h4>
                    <p className="text-sm opacity-80 text-center">Rotina ID: {rotinaId}</p>
                    
                    <div className="goal-control">
                        <button 
                            type="button" 
                            className="goal-adjust-btn" 
                            onClick={handleDecrement}
                            disabled={goal <= 0 || loading}
                        >
                            -
                        </button>
                        <span className="goal-display">{goal} {unit}</span>
                        <button 
                            type="button" 
                            className="goal-adjust-btn" 
                            onClick={handleIncrement}
                            disabled={loading}
                        >
                            +
                        </button>
                    </div>

                    <div className="modal-actions">
                        <button 
                            type="submit" 
                            className="button-base button-primary-dark"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button 
                            type="button" 
                            className="button-base button-secondary-bg"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGoalModal;