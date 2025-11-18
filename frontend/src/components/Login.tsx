import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header'; 
import { useAuth, API_BASE_URL } from '../context/AuthContext'; // Importando useAuth e API_BASE_URL
import '../styles/App.css'; 
import '../styles/Login.css'; 

const LoginPage = () => {
    const navigate = useNavigate();
    // Use 'login' aqui
    const { login } = useAuth(); 
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha: password }),
            });

            const data = await response.json();

            if (response.ok) {
                // 🔑 CORREÇÃO CRÍTICA: Capturar nivelAcesso e incluí-lo no objeto de usuário
                const user = { 
                    id: data.id, 
                    email: data.email, 
                    nome: data.nome,
                    nivelAcesso: data.nivelAcesso // ⬅️ CAMPO ADICIONADO AQUI
                }; 
                
                // O 'as any' é necessário porque o tipo 'User' no contexto foi atualizado
                login(data.token, user as any); 
                setMessage('Login realizado com sucesso! Redirecionando...');
                
                setTimeout(() => {
                    navigate('/dashboard'); 
                }, 1000);
                
            } else {
                setMessage(`Erro no Login: ${data.message || 'Credenciais inválidas.'}`);
            }

        } catch (error) {
            console.error('Erro de rede/servidor:', error);
            setMessage('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrimeiroAcesso = () => {
        navigate('/cadastro'); 
    };

    const handleEsqueciSenha = () => {
        navigate('/esqueci-senha'); 
    };

    return (
        <div className="login-page-container">
            <Header showActions={false} /> 
            
            <main className="login-main-content">
                
                <div className="login-headline">
                    <h1>Cada login é um passo a mais na construção de uma rotina saudável.</h1>
                </div>

                <div className="login-card-area">
                    <div className="login-card">
                        <form onSubmit={handleLogin}>
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
                            
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    id="password" 
                                    placeholder=" " 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label htmlFor="password">Senha</label>
                            </div>

                            {message && (
                                <p className={`message ${message.includes('Erro') ? 'text-red-500' : 'text-green-500'} text-center mt-3`}>
                                    {message}
                                </p>
                            )}

                            <div className="links-container">
                                <button 
                                    type="button" 
                                    className="small-link-button" 
                                    onClick={handlePrimeiroAcesso}
                                >
                                    Primeiro acesso
                                </button>
                                <button 
                                    type="button" 
                                    className="small-link-button" 
                                    onClick={handleEsqueciSenha}
                                >
                                    Esqueci minha senha
                                </button>
                            </div>

                            <button 
                                type="submit" 
                                className="button-base button-primary-dark login-button"
                                disabled={loading}
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default LoginPage;