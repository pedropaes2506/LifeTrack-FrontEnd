import React, { useState } from 'react';

// 1. Importa os componentes de layout
import Header from './Header'; 
import Sidebar from './Sidebar';

// 2. Importa os estilos
import '../styles/App.css'; 
import '../styles/HabitsManageAdmin.css'; // Arquivo de estilo desta página

// --- Ícones SVG (Definidos aqui para evitar erros de importação) ---
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="#333">
    <path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="#333">
    <path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);
// --- Fim dos Ícones ---

// --- Dados Iniciais e Tipos ---
type Habit = {
  name: string;
  measure: string;
  goal: string;
  active: boolean;
};

const initialHabitsData: Habit[] = [
  { name: "Hidratação", measure: "ml", goal: "2400ml", active: true },
  { name: "Sono", measure: "hora", goal: "8h/noite", active: true },
  { name: "Alimentação", measure: "atividade", goal: "3 refeições", active: true },
  { name: "Meditação", measure: "min", goal: "10 min/dia", active: true },
  { name: "Estudo", measure: "min/h", goal: "45min/dia", active: true },
];
// --- Fim Dados ---


// --- COMPONENTE MODAL: Adicionar Hábito ---
const AddHabitModal: React.FC<{ onClose: () => void; onSave: (newHabit: Habit) => void; }> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [measure, setMeasure] = useState('');
  const [goal, setGoal] = useState('');

  const handleSaveClick = () => {
    if (!name || !measure || !goal) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    onSave({ name, measure, goal, active: true });
  };

  return (
    <div className="modal-overlay-admin">
      <div className="modal-content-admin">
        <h2 className="modal-header-admin">Novo Hábito</h2>
        <div className="modal-body-admin">
          <div className="form-group-admin">
            <label htmlFor="habito-nome">Nome do Hábito</label>
            <input id="habito-nome" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group-admin">
            <label htmlFor="habito-medida">Medida</label>
            <input id="habito-medida" type="text" value={measure} onChange={(e) => setMeasure(e.target.value)} />
          </div>
          <div className="form-group-admin">
            <label htmlFor="habito-meta">Meta Padrão</label>
            <input id="habito-meta" type="text" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer-admin">
          <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSaveClick}>Salvar</button>
        </div>
      </div>
    </div>
  );
};
// --- FIM MODAL ADICIONAR ---


// --- COMPONENTE MODAL: Editar Hábito ---
const EditHabitModal: React.FC<{ habit: Habit; onClose: () => void; onSave: (originalName: string, updatedHabit: Habit) => void; }> = ({ habit, onClose, onSave }) => {
  const [name, setName] = useState(habit.name);
  const [measure, setMeasure] = useState(habit.measure);
  const [goal, setGoal] = useState(habit.goal);
  const [active, setActive] = useState(habit.active);

  const handleSaveClick = () => {
    if (!name || !measure || !goal) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    onSave(habit.name, { name, measure, goal, active });
  };

  return (
    <div className="modal-overlay-admin">
      <div className="modal-content-admin">
        <h2 className="modal-header-admin">Editar Hábito</h2>
        <div className="modal-body-admin">
          <div className="form-group-admin">
            <label htmlFor="habito-nome-edit">Nome do Hábito</label>
            <input id="habito-nome-edit" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group-admin">
            <label htmlFor="habito-medida-edit">Medida</label>
            <input id="habito-medida-edit" type="text" value={measure} onChange={(e) => setMeasure(e.target.value)} />
          </div>
          <div className="form-group-admin">
            <label htmlFor="habito-meta-edit">Meta Padrão</label>
            <input id="habito-meta-edit" type="text" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
          {/* Checkbox "Hábito Ativo" */}
          <div className="form-group-admin checkbox-group-admin">
            <input 
              id="habito-ativo-edit" 
              type="checkbox" 
              checked={active} 
              onChange={(e) => setActive(e.target.checked)} 
            />
            <label htmlFor="habito-ativo-edit">Hábito Ativo</label>
          </div>
        </div>
        <div className="modal-footer-admin">
          <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSaveClick}>Salvar</button>
        </div>
      </div>
    </div>
  );
};
// --- FIM MODAL EDITAR ---


// --- COMPONENTE MODAL: Excluir Hábito ---
const DeleteModal: React.FC<{ habitName: string; onClose: () => void; onConfirm: () => void; }> = ({ habitName, onClose, onConfirm }) => {
  return (
    <div className="modal-overlay-admin">
      <div className="modal-content-admin delete-modal">
        <h2 className="modal-header-admin">Excluir Hábito</h2>
        <div className="modal-body-admin">
          <p>Tem certeza de que deseja excluir o hábito <strong>{habitName}</strong>?</p>
          <p>Esta ação não pode ser desfeita.</p>
        </div>
        <div className="modal-footer-admin">
          <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-modal-delete" onClick={onConfirm}>Excluir</button>
        </div>
      </div>
    </div>
  );
};
// --- FIM MODAL EXCLUIR ---


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
const HabitsManageAdmin: React.FC = () => {
  // --- Estados da Página ---
  const [habits, setHabits] = useState(initialHabitsData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  // --- Funções de Manipulação ---
  
  const handleOpenEditModal = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsEditModalOpen(true);
  };
  
  const handleOpenDeleteModal = (habit: Habit) => {
    setHabitToDelete(habit);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsEditModalOpen(false);
    setHabitToDelete(null);
    setHabitToEdit(null);
  };

  const handleSaveNewHabit = (newHabit: Habit) => {
    setHabits(prevHabits => [...prevHabits, newHabit]);
    handleCloseModals();
  };

  const handleSaveEditHabit = (originalName: string, updatedHabit: Habit) => {
    setHabits(prevHabits => 
      prevHabits.map(h => (h.name === originalName ? updatedHabit : h))
    );
    handleCloseModals();
  };

  const handleConfirmDelete = () => {
    if (habitToDelete) {
      setHabits(prevHabits => prevHabits.filter(h => h.name !== habitToDelete.name));
    }
    handleCloseModals();
  };

  return (
    <div className="app-container">
      <Header />
      <div className="app-body-layout">
        <Sidebar />
        
        <main className="app-content-area">
          <div className="manage-habits-container">
            <header className="manage-habits-header">
              <h1>Gerenciar Habitos</h1>
            </header>

            <div className="habits-list-container">
              <div className="habits-list-header">
                <span>Nome do Hábito</span><span>Medida</span><span>Meta Padrão</span><span>Ativo</span><span>Ações</span>
              </div>
              <div className="habits-list-body">
                {habits.map((habit) => (
                  <div key={habit.name} className="habit-row">
                    <span>{habit.name}</span>
                    <span>{habit.measure}</span>
                    <span>{habit.goal}</span>
                    <span className="habit-active-check">{habit.active ? '✓' : '✗'}</span>
                    <div className="habit-actions">
                      <button className="icon-button" onClick={() => handleOpenEditModal(habit)}><EditIcon /></button>
                      <button className="icon-button" onClick={() => handleOpenDeleteModal(habit)}><DeleteIcon /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="habits-actions-footer">
              <button className="btn-habits-save">Salvar Alterações</button>
              <button className="btn-habits-new" onClick={() => setIsAddModalOpen(true)}>+ Novo Hábito</button>
            </div>
          </div>
          
          {/* --- Renderização Condicional dos Modais --- */}
          {isAddModalOpen && <AddHabitModal onClose={handleCloseModals} onSave={handleSaveNewHabit} />}
          
          {isEditModalOpen && habitToEdit && (
            <EditHabitModal
              habit={habitToEdit}
              onClose={handleCloseModals}
              onSave={handleSaveEditHabit}
            />
          )}

          {isDeleteModalOpen && habitToDelete && (
            <DeleteModal 
              habitName={habitToDelete.name}
              onClose={handleCloseModals}
              onConfirm={handleConfirmDelete}
            />
          )}

        </main>
      </div>
    </div>
  );
};

export default HabitsManageAdmin;