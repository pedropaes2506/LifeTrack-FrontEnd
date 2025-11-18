import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { API_BASE_URL } from '../context/AuthContext';
import '../styles/App.css'; 
import '../styles/Cadastro.css'; 

const CadastroPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cpf: '',
        password: '',
        confirmPassword: '',
        sexo: '',
        dataNascimento: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
        setMessage(''); // Limpa a mensagem ao digitar
    };

    const handleCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        // Validação básica de senha no frontend
        if (formData.password !== formData.confirmPassword) {
            setMessage('Erro: As senhas não coincidem!');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cadastro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Cadastro realizado com sucesso! Redirecionando para o login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                // Mensagem de erro do backend (ex: email/cpf já cadastrado)
                setMessage(`Erro no cadastro: ${data.message || 'Ocorreu um erro desconhecido.'}`);
            }

        } catch (error) {
            console.error('Erro de rede/servidor:', error);
            setMessage('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="cadastro-page-container">
            <Header showActions={false} />
            
            <main className="cadastro-main-content">
                
                <div className="cadastro-card-area">
                    <div className="cadastro-card">
                        <form onSubmit={handleCadastro}>
                            
                            {/* Nome Completo */}
                            <div className="input-group full-width">
                                <input 
                                    type="text" 
                                    id="nome" 
                                    placeholder=" " 
                                    required 
                                    value={formData.nome}
                                    onChange={handleChange}
                                />
                                <label htmlFor="nome">Nome Completo</label>
                            </div>
                            
                            {/* Email */}
                            <div className="input-group">
                                <input 
                                    type="email" 
                                    id="email" 
                                    placeholder=" " 
                                    required 
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <label htmlFor="email">Email</label>
                            </div>
                            
                            {/* CPF */}
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    id="cpf" 
                                    placeholder=" " 
                                    required 
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    maxLength={11} // Limite de 11 caracteres para CPF
                                />
                                <label htmlFor="cpf">CPF</label>
                            </div>
                            
                            {/* Senha */}
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    id="password" 
                                    placeholder=" " 
                                    required 
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <label htmlFor="password">Senha</label>
                            </div>

                            {/* Sexo - CORRIGIDO para enviar M, F, O */}
                            <div className="input-group">
                                <select 
                                    id="sexo" 
                                    required 
                                    value={formData.sexo}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Selecione</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                    <option value="O">Outro</option>
                                </select>
                                <label htmlFor="sexo">Sexo</label>
                            </div>
                            
                            {/* Confirme a Senha */}
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    placeholder=" " 
                                    required 
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <label htmlFor="confirmPassword">Confirme a Senha</label>
                            </div>

                            {/* Data de Nascimento */}
                            <div className="input-group">
                                <input 
                                    type="date" 
                                    id="dataNascimento" 
                                    required 
                                    value={formData.dataNascimento}
                                    onChange={handleChange}
                                />
                                <label htmlFor="dataNascimento">Data de Nascimento</label>
                            </div>
                            
                            {message && (
                                <p className={`message ${message.includes('Erro') ? 'text-red-500' : 'text-green-500'} text-center mt-3`}>
                                    {message}
                                </p>
                            )}

                            <button 
                                type="submit" 
                                className="button-base button-primary-dark cadastro-button"
                                disabled={loading}
                            >
                                {loading ? 'Cadastrando...' : 'Cadastrar'}
                            </button>

                            <div className="links-container">
                                <button 
                                    type="button" 
                                    className="small-link-button" 
                                    onClick={handleGoToLogin}
                                >
                                    Já tenho uma conta.
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="cadastro-headline">
                    <h1>Cadastre-se para construir uma rotina mais saudável, um dia de cada vez.</h1>
                </div>

            </main>
        </div>
    );
};

export default CadastroPage;