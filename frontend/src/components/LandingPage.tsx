import { useNavigate } from 'react-router-dom';
import '../styles/App.css'; 
import '../styles/LandingPage.css'; 
import logo from '../assets/logo.png'; 

const LandingPage = () => {
    const navigate = useNavigate();

    const handleCadastro = () => {
        navigate('/cadastro'); 
    };

    const handleLogin = () => {
        navigate('/login'); 
    };

    return (
        <div className="landing-page-container">
            <div className="landing-content-left">
                <div className="landing-logo">
                    <img 
                        src={logo} 
                        alt="LifeTrack Logo" 
                        style={{ width: '4.5rem', height: '4rem' }} 
                    />
                    <span>LifeTrack</span>
                </div>
                
                <h1>Sua jornada de bem-estar começa aqui!</h1>
            </div>

            <div className="landing-content-right">
                <p>Comece hoje sua jornada para uma vida mais saudável.</p>
                
                <div className="landing-buttons">
                    <button className="button-base button-primary-dark" onClick={handleCadastro}>
                        Cadastre-se
                    </button>
                    <button className="button-base button-primary-dark" onClick={handleLogin}>
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;