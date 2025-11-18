import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header'; 
import Sidebar from './Sidebar';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import '../styles/App.css'; 
import '../styles/HabitsManageAdmin.css'; 

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

type TipoUnidade = 'ML' | 'HORAS' | 'MINUTOS' | 'UNIDADE' | 'PASSOS';

interface Rotina {
  id: number;
  nome: string;
  metaValorPadrao: number | null;
  tipoUnidade: TipoUnidade;
  ativa: boolean;
}

const unitOptions: { label: string; value: TipoUnidade }[] = [
    { label: 'Mililitros (ML)', value: 'ML' },
    { label: 'Horas (HORAS)', value: 'HORAS' },
    { label: 'Minutos (MINUTOS)', value: 'MINUTOS' },
    { label: 'Contagem (UNIDADE)', value: 'UNIDADE' },
    { label: 'Passos (PASSOS)', value: 'PASSOS' },
];

const API_ADMIN_URL = API_BASE_URL.replace('/public', '/admin'); 

const AddHabitModal: React.FC<{ onClose: () => void; onSave: () => void; }> = ({ onClose, onSave }) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [measure, setMeasure] = useState<TipoUnidade>('UNIDADE'); // Padrão: UNIDADE
  const [goal, setGoal] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleSaveClick = async () => {
    if (!name || !goal) {
      setError("Nome e Meta Padrão são obrigatórios.");
      return;
    }
    setLoading(true);

    try {
        const response = await fetch(`${API_ADMIN_URL}/rotinas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome: name,
                metaValorPadrao: parseFloat(goal) || null,
                tipoUnidade: measure,
                ativa: true
            })
        });

        const data = await response.json();

        if (response.ok) {
            onSave(); // Notifica o componente principal para recarregar
            onClose();
        } else {
            setError(data.message || "Falha ao criar rotina.");
        }
    } catch (e) {
        setError("Erro de rede ao salvar.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-admin" onClick={onClose}>
      <div className="modal-content-admin" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-header-admin">Novo Hábito</h2>
        <div className="modal-body-admin">
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="form-group-admin">
            <label htmlFor="habito-nome">Nome do Hábito</label>
            <input id="habito-nome" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>
          <div className="form-group-admin">
            <label htmlFor="habito-medida">Medida</label>
            <select id="habito-medida" value={measure} onChange={(e) => setMeasure(e.target.value as TipoUnidade)} disabled={loading}>
                {unitOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
          </div>
          <div className="form-group-admin">
            <label htmlFor="habito-meta">Meta Padrão</label>
            <input id="habito-meta" type="number" value={goal} onChange={(e) => setGoal(e.target.value)} disabled={loading} />
          </div>
        </div>
        <div className="modal-footer-admin">
          <button className="btn-modal-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSaveClick} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};


const EditHabitModal: React.FC<{ habit: Rotina; onClose: () => void; onSave: () => void; }> = ({ habit, onClose, onSave }) => {
  const { token } = useAuth();
  const [name, setName] = useState(habit.nome);
  const [measure, setMeasure] = useState<TipoUnidade>(habit.tipoUnidade);
  const [goal, setGoal] = useState(habit.metaValorPadrao?.toString() || '');
  const [active, setActive] = useState(habit.ativa);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleSaveClick = async () => {
    if (!name) {
      setError("O nome do hábito é obrigatório.");
      return;
    }
    setLoading(true);

    try {
        const response = await fetch(`${API_ADMIN_URL}/rotinas/${habit.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome: name,
                metaValorPadrao: parseFloat(goal) || null,
                tipoUnidade: measure,
                ativa: active
            })
        });

        const data = await response.json();

        if (response.ok) {
            onSave();
            onClose();
        } else {
            setError(data.message || "Falha ao editar rotina.");
        }
    } catch (e) {
        setError("Erro de rede ao salvar.");
    } finally {
        setLoading(false);
    }
  };


  return (
    <div className="modal-overlay-admin" onClick={onClose}>
      <div className="modal-content-admin" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-header-admin">Editar Hábito</h2>
        <div className="modal-body-admin">
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="form-group-admin">
            <label htmlFor="habito-nome-edit">Nome do Hábito</label>
            <input id="habito-nome-edit" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>
          <div className="form-group-admin">
            <label htmlFor="habito-medida-edit">Medida</label>
            <select id="habito-medida-edit" value={measure} onChange={(e) => setMeasure(e.target.value as TipoUnidade)} disabled={loading}>
                {unitOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
          </div>
          <div className="form-group-admin">
            <label htmlFor="habito-meta-edit">Meta Padrão</label>
            <input id="habito-meta-edit" type="number" value={goal} onChange={(e) => setGoal(e.target.value)} disabled={loading} />
          </div>
          {/* Checkbox "Hábito Ativo" */}
          <div className="form-group-admin checkbox-group-admin">
            <input 
              id="habito-ativo-edit" 
              type="checkbox" 
              checked={active} 
              onChange={(e) => setActive(e.target.checked)} 
              disabled={loading}
            />
            <label htmlFor="habito-ativo-edit">Hábito Ativo</label>
          </div>
        </div>
        <div className="modal-footer-admin">
          <button className="btn-modal-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSaveClick} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};


const DeleteModal: React.FC<{ habit: Rotina; onClose: () => void; onConfirm: () => void; }> = ({ habit, onClose, onConfirm }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    setLoading(true);

    try {
        const response = await fetch(`${API_ADMIN_URL}/rotinas/${habit.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // O backend retorna 204 No Content para sucesso, sem body.
        if (response.status === 204) {
            onConfirm(); // Chama a função de recarregamento
            onClose();
        } else {
             const data = await response.json();
             setError(data.message || "Falha ao deletar rotina.");
        }
    } catch (e) {
        setError("Erro de rede.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-admin" onClick={onClose}>
      <div className="modal-content-admin delete-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-header-admin">Excluir Hábito</h2>
        <div className="modal-body-admin">
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <p>Tem certeza de que deseja excluir o hábito <strong>{habit.nome}</strong>?</p>
          <p>Esta ação não pode ser desfeita.</p>
        </div>
        <div className="modal-footer-admin">
          <button className="btn-modal-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-modal-delete" onClick={handleConfirmDelete} disabled={loading}>
            {loading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
};


const HabitsManageAdmin: React.FC = () => {
  const { token } = useAuth();
  const [habits, setHabits] = useState<Rotina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Rotina | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<Rotina | null>(null);

  const fetchHabits = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
        const response = await fetch(`${API_ADMIN_URL}/rotinas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            setHabits(data);
        } else {
            setError(data.message || "Falha ao carregar lista de rotinas.");
        }
    } catch (e) {
        setError("Erro de rede ao buscar rotinas.");
    } finally {
        setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);


  
  const handleOpenEditModal = (habit: Rotina) => {
    setHabitToEdit(habit);
    setIsEditModalOpen(true);
  };
  
  const handleOpenDeleteModal = (habit: Rotina) => {
    setHabitToDelete(habit);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsEditModalOpen(false);
    setHabitToDelete(null);
    setHabitToEdit(null);
    fetchHabits();
  };


  return (
    <div className="app-container">
      <Header />
      <div className="app-body-layout">
        <Sidebar />
        
        <main className="app-content-area">
          <div className="manage-habits-container">
            <header className="manage-habits-header">
              <h1>Gerenciar Hábitos</h1>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </header>

            <div className="habits-list-container">
              <div className="habits-list-header">
                <span>ID</span><span>Nome do Hábito</span><span>Medida</span><span>Meta Padrão</span><span>Ativo</span><span>Ações</span>
              </div>
              <div className="habits-list-body">
                {loading ? (
                    <div className="p-4 text-center">Carregando hábitos...</div>
                ) : habits.length === 0 ? (
                    <div className="p-4 text-center">Nenhum hábito mestre cadastrado.</div>
                ) : (
                    habits.map((habit) => (
                      <div key={habit.id} className="habit-row">
                        <span>{habit.id}</span>
                        <span>{habit.nome}</span>
                        <span>{habit.tipoUnidade}</span>
                        <span>{habit.metaValorPadrao || 'N/A'}</span>
                        <span className="habit-active-check">{habit.ativa ? '✓' : '✗'}</span>
                        <div className="habit-actions">
                          <button className="icon-button" onClick={() => handleOpenEditModal(habit)}><EditIcon /></button>
                          <button className="icon-button" onClick={() => handleOpenDeleteModal(habit)}><DeleteIcon /></button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="habits-actions-footer">
              <button className="btn-habits-new" onClick={() => setIsAddModalOpen(true)}>+ Novo Hábito</button>
            </div>
          </div>
          
          {isAddModalOpen && <AddHabitModal onClose={handleCloseModals} onSave={handleCloseModals} />}
          
          {isEditModalOpen && habitToEdit && (
            <EditHabitModal
              habit={habitToEdit}
              onClose={handleCloseModals}
              onSave={handleCloseModals}
            />
          )}

          {isDeleteModalOpen && habitToDelete && (
            <DeleteModal 
              habit={habitToDelete}
              onClose={handleCloseModals}
              onConfirm={handleCloseModals}
            />
          )}

        </main>
      </div>
    </div>
  );
};

export default HabitsManageAdmin;