import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth, API_BASE_URL } from '../context/AuthContext'; // ⬅️ Importar AuthContext
import '../styles/App.css';
import '../styles/AlterarSenha.css';

const API_PRIVATE_URL = API_BASE_URL.replace('/public', '/private');

const AlterarSenhaPage: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useAuth(); // Obter token
    
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null); // Limpar erro ao digitar
        setSuccessMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setError(null);
        setSuccessMessage(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Erro: A nova senha e a confirmação não coincidem!');
            return;
        }
        
        if (!token) {
             setError('Erro: Token de autenticação ausente. Faça login novamente.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_PRIVATE_URL}/senha/alterar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Senha alterada com sucesso! Redirecionando...');
                
                // Limpa o formulário
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                
                setTimeout(() => {
                    navigate('/dashboard'); 
                }, 1500);

            } else {
                // Trata erros 400, 401, 500 do backend
                setError(data.message || "Erro interno ao alterar a senha.");
            }

        } catch (e) {
            setError("Erro de rede ao comunicar com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="alterar-senha-page-container">
            <Header />

            <Sidebar />
            
            <main className="alterar-senha-main-content">
                <div className="alterar-senha-headline">
                    <h1>Alterar Senha</h1>
                    <p>Confirme sua senha atual e defina uma nova senha</p>
                </div>

                <div className="alterar-senha-card-area">
                    <div className="alterar-senha-card">
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
                            )}
                             {successMessage && (
                                <p className="text-sm text-green-500 mb-4 text-center">{successMessage}</p>
                            )}
                            
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    id="currentPassword"
                                    name="currentPassword"
                                    placeholder=" "
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    required 
                                    disabled={loading}
                                />
                                <label htmlFor="currentPassword">Senha atual</label>
                            </div>
                            
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    id="newPassword"
                                    name="newPassword"
                                    placeholder=" "
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required 
                                    disabled={loading}
                                />
                                <label htmlFor="newPassword">Nova senha</label>
                                
                            </div>

                            <div className="input-group">
                                <input 
                                    type="password" 
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder=" "
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required 
                                    disabled={loading}
                                />
                                <label htmlFor="confirmPassword">Confirme sua senha</label>
                                
                            </div>

                            <button 
                                type="submit" 
                                className="button-base button-primary-dark alterar-senha-button"
                                disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                            >
                                {loading ? 'Alterando...' : 'Alterar'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AlterarSenhaPage;