import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header'; 
import { API_BASE_URL } from '../context/AuthContext';
import '../styles/App.css'; 
import '../styles/Login.css'; 
import '../styles/AuthForm.css'; 

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/esqueci-senha`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Email enviado com sucesso! Redirecionando...');
                setTimeout(() => {
                    navigate('/email-enviado'); // Redireciona para a página de sucesso
                }, 1000);
            } else {
                setMessage(`Erro: ${data.message || 'Ocorreu um erro ao enviar o email.'}`);
            }

        } catch (error) {
            console.error('Erro de rede/servidor:', error);
            setMessage('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <Header showActions={false} />
            
            <main className="auth-form-main">
                <div className="auth-card">
                    <form onSubmit={handleSubmit}>
                        <h2>Confirme seu email:</h2>
                        
                        <div className="input-group">
                            <input 
                                type="email" 
                                id="email" 
                                placeholder=" " 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <label htmlFor="email">Email</label>
                        </div>
                        
                        {message && (
                            <p className={`message ${message.includes('Erro') ? 'text-red-500' : 'text-green-500'} text-center mt-3`}>
                                {message}
                            </p>
                        )}

                        <button 
                            type="submit" 
                            className="button-base button-primary-dark auth-button"
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ForgotPasswordPage;