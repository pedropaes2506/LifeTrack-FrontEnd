import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/App.css';
import '../styles/AlterarSenha.css';

const AlterarSenhaPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        console.log('Alteração de senha:', formData);
        alert('Senha alterada com sucesso!');
        navigate('/dashboard');
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
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    id="currentPassword"
                                    name="currentPassword"
                                    placeholder=" "
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    required 
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
                                />
                                <label htmlFor="confirmPassword">Confirme sua senha</label>
                                
                            </div>

                            <button 
                                type="submit" 
                                className="button-base button-primary-dark alterar-senha-button"
                            >
                                Alterar
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AlterarSenhaPage;