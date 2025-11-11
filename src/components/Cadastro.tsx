import { useNavigate } from 'react-router-dom';
import Header from './Header'; 
import '../styles/App.css'; 
import '../styles/Cadastro.css'; 

const CadastroPage = () => {
    const navigate = useNavigate();

    const handleCadastro = (e: React.FormEvent) => {
        e.preventDefault(); 
        console.log('Tentativa de Cadastro');
    };

    const handleGoToLogin = () => {
        navigate('/login'); 
    };

    return (
        <div className="cadastro-page-container">
            <Header /> 
            
            <main className="cadastro-main-content">
                
                <div className="cadastro-card-area">
                    <div className="cadastro-card">
                        <form onSubmit={handleCadastro}>
                            
                            <div className="input-group full-width">
                                <input type="text" id="nome" placeholder=" " required />
                                <label htmlFor="nome">Nome Completo</label>
                            </div>
                            
                            <div className="input-group">
                                <input type="email" id="email" placeholder=" " required />
                                <label htmlFor="email">Email</label>
                            </div>
                            <div className="input-group">
                                <input type="text" id="cpf" placeholder=" " required />
                                <label htmlFor="cpf">CPF</label>
                            </div>
                            
                            <div className="input-group">
                                <input type="password" id="password" placeholder=" " required />
                                <label htmlFor="password">Senha</label>
                            </div>

                            <div className="input-group">
                                <select id="sexo" required>
                                    <option value="" disabled selected></option>
                                    <option value="masculino">Masculino</option>
                                    <option value="feminino">Feminino</option>
                                    <option value="outro">Outro</option>
                                </select>
                                <label htmlFor="sexo">Sexo</label>
                            </div>
                            
                            <div className="input-group">
                                <input type="password" id="confirm-password" placeholder=" " required />
                                <label htmlFor="confirm-password">Confirme a Senha</label>
                            </div>

                            <div className="input-group">
                                <input type="date" id="data-nascimento" required />
                                <label htmlFor="data-nascimento">Data de Nascimento</label>
                            </div>

                            <button 
                                type="submit" 
                                className="button-base button-primary-dark cadastro-button"
                            >
                                Cadastrar
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