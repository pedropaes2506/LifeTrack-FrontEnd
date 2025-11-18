import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import '../styles/MeuPerfil.css';

const API_PRIVATE_URL = API_BASE_URL.replace('/public', '/private');

interface UserProfile {
    nomeCompleto: string;
    email: string;
    sexo: string; // 'M', 'F', 'O' ou ''
    dataNascimento: string; // Formato YYYY-MM-DD
}

const MeuPerfil: React.FC = () => {
    const navigate = useNavigate();
    const { token, logout, updateUserName } = useAuth(); 

    const [dadosUsuario, setDadosUsuario] = useState<UserProfile>({
        nomeCompleto: '',
        email: '',
        sexo: '',
        dataNascimento: ''
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchProfileData = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_PRIVATE_URL}/perfil`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                setDadosUsuario({
                    nomeCompleto: data.nomeCompleto || '',
                    email: data.email || '',
                    // O backend retorna 'M', 'F', 'O' ou '' (string vazia)
                    sexo: data.sexo || '', 
                    dataNascimento: data.dataNascimento || '' 
                });
            } else {
                setError(data.message || "Erro ao carregar o perfil.");
            }
        } catch (e) {
            setError("Erro de rede ao buscar dados do perfil.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDadosUsuario(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch(`${API_PRIVATE_URL}/perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nomeCompleto: dadosUsuario.nomeCompleto,
                    sexo: dadosUsuario.sexo,
                    dataNascimento: dadosUsuario.dataNascimento
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Alterações salvas com sucesso!');
                if (updateUserName) {
                    updateUserName(dadosUsuario.nomeCompleto);
                }
            } else {
                setError(data.message || "Erro ao salvar alterações.");
            }
        } catch (e) {
            setError("Erro de rede ao salvar dados.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAlterarSenha = () => {
        navigate('/alterar-senha'); 
    };

    const handleLogout = () => {
        if (window.confirm('Tem certeza que deseja sair?')) {
            logout(); 
            navigate('/login');
        }
    };

    return (
        <div className="page-layout">
            <Header />
            <Sidebar />
            
            <main className="page-main-content">
                
                <div className="perfil-header">
                    <h1>Meu Perfil</h1>
                    <p>Gerencie suas informações pessoais.</p>
                </div>
                
                <div className="perfil-container">
                    
                    {loading && <div className="p-4 bg-gray-100 text-gray-700 rounded-lg">Carregando dados...</div>}
                    {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                    
                    {!loading && !error && (
                        <div className="perfil-card">
                            <form onSubmit={handleSalvar}>
                                
                                <div className="campo-perfil">
                                    <label htmlFor="nomeCompleto">Nome Completo</label>
                                    <input
                                        type="text"
                                        id="nomeCompleto"
                                        name="nomeCompleto"
                                        value={dadosUsuario.nomeCompleto} 
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="campo-perfil">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={dadosUsuario.email}
                                        disabled
                                        className="bg-gray-200 cursor-not-allowed"
                                    />
                                </div>

                                {/* SEXO (COM OPÇÕES CORRIGIDAS) */}
                                <div className="campo-perfil">
                                    <label htmlFor="sexo">Sexo</label>
                                    <select
                                        id="sexo"
                                        name="sexo"
                                        value={dadosUsuario.sexo}
                                        onChange={handleChange}
                                    >
                                        <option value="F">Feminino</option>
                                        <option value="M">Masculino</option>
                                        <option value="O">Outro</option>
                                    </select>
                                </div>

                                {/* DATA DE NASCIMENTO */}
                                <div className="campo-perfil">
                                    <label htmlFor="dataNascimento">Data de Nascimento</label>
                                    <input
                                        type="date"
                                        id="dataNascimento"
                                        name="dataNascimento"
                                        value={dadosUsuario.dataNascimento}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split('T')[0]} 
                                    />
                                </div>

                                <div className="acoes-perfil">
                                    <button 
                                        type="submit" 
                                        className="botao-salvar"
                                        disabled={isSaving || loading}
                                    >
                                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                    
                                    <button 
                                        type="button" 
                                        className="botao-secundario"
                                        onClick={handleAlterarSenha}
                                    >
                                        Alterar Senha
                                    </button>
                                    
                                    <button 
                                        type="button" 
                                        className="botao-logout"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MeuPerfil;