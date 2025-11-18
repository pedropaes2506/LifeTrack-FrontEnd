import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/MeuPerfil.css';

const MeuPerfil: React.FC = () => {
    const navigate = useNavigate();
    
    const [dadosUsuario, setDadosUsuario] = useState({
        nomeCompleto: 'João Silva',
        email: 'joao.silva@email.com',
        sexo: 'masculino',
        dataNascimento: '1990-05-15'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDadosUsuario(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSalvar = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Dados salvos:', dadosUsuario);
        alert('Alterações salvas com sucesso!');
    };

    const handleAlterarSenha = () => {
        navigate('/alterar-senha');
    };

    const handleLogout = () => {
        if (window.confirm('Tem certeza que deseja sair?')) {
            console.log('Usuário deslogado');
            navigate('/login');
        }
    };

    return (
        <div className="dashboard-layout">
            <Header />
            <Sidebar />
            
            <main className="dashboard-main-content">
                {/* TÍTULO PRINCIPAL */}
                <h1 className="titulo-principal">Meu Perfil</h1>

                {/* CABEÇALHO DO PERFIL */}
                <div className="perfil-header">
                    <h2>Informações</h2>
                    <p></p>
                </div>
                
                <div className="perfil-container">

                    {/* FORMULÁRIO DO PERFIL */}
                    <div className="perfil-card">
                        <form onSubmit={handleSalvar}>
                            {/* NOME COMPLETO */}
                            <div className="campo-perfil">
                                <label htmlFor="nomeCompleto">Nome Completo</label>
                                <input
                                    type="text"
                                    id="nomeCompleto"
                                    name="nomeCompleto"
                                    value={dadosUsuario.nomeCompleto}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* EMAIL */}
                            <div className="campo-perfil">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={dadosUsuario.email}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* SEXO */}
                            <div className="campo-perfil">
                                <label htmlFor="sexo">Sexo</label>
                                <select
                                    id="sexo"
                                    name="sexo"
                                    value={dadosUsuario.sexo}
                                    onChange={handleChange}
                                >
                                    <option value="masculino">Masculino</option>
                                    <option value="feminino">Feminino</option>
                                    <option value="outro">Outro</option>
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
                                />
                            </div>

                            {/* BOTÕES DE AÇÃO */}
                            <div className="acoes-perfil">
                                <button type="submit" className="botao-salvar">
                                    Salvar Alterações
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
                </div>
            </main>
        </div>
    );
};

export default MeuPerfil;