import { useNavigate } from 'react-router-dom';
import Header from './Header'; 
import '../styles/App.css'; 
import '../styles/Login.css'; 

const LoginPage = () => {
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault(); 
        console.log('Tentativa de Login');
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
                                <input type="email" id="email" placeholder=" " required />
                                <label htmlFor="email">Email</label>
                            </div>
                            
                            <div className="input-group">
                                <input type="password" id="password" placeholder=" " required />
                                <label htmlFor="password">Senha</label>
                            </div>

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

                            <button type="submit" className="button-base button-primary-dark login-button">
                                Entrar
                            </button>
                        </form>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default LoginPage;