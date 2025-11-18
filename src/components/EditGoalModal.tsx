import React, { useState } from 'react';
import '../styles/EditGoalModal.css'; 

interface EditGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentGoal: number;
    unit: string;
    onSave: (newGoal: number) => void;
}

const EditGoalModal: React.FC<EditGoalModalProps> = ({ isOpen, onClose, currentGoal, unit, onSave }) => {
    
    const [goal, setGoal] = useState(currentGoal);

    if (!isOpen) {
        return null;
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(goal);
        onClose();
    };

    const handleIncrement = () => {
        setGoal(prev => prev + (unit === 'ml' ? 100 : 10));
    };

    const handleDecrement = () => {
        setGoal(prev => Math.max(0, prev - (unit === 'ml' ? 100 : 10)));
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSave}>
                    <h4>Meta de Consumo Diário</h4>
                    
                    <div className="goal-control">
                        <button type="button" className="goal-adjust-btn" onClick={handleDecrement}>-</button>
                        <span className="goal-display">{goal} {unit}</span>
                        <button type="button" className="goal-adjust-btn" onClick={handleIncrement}>+</button>
                    </div>

                    <div className="modal-actions">
                        <button 
                            type="submit" 
                            className="button-base button-primary-dark"
                        >
                            Salvar
                        </button>
                        <button 
                            type="button" 
                            className="button-base button-secondary-bg"
                            onClick={onClose}
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