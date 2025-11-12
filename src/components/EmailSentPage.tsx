import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header'; 
import '../styles/App.css'; 
import '../styles/AuthForm.css'; 

const EmailSentPage: React.FC = () => {
    const navigate = useNavigate();

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="auth-form-container">
            <Header showActions={false} />
            
            <main className="auth-form-main">
                <div className="auth-card">
                    <h2>Email enviado!</h2>
                    <p>Siga as instruções enviadas para alterar a senha!</p>
                    
                    <button 
                        onClick={handleGoToLogin} 
                        className="button-base button-primary-dark auth-button"
                    >
                        Login
                    </button>
                </div>
            </main>
        </div>
    );
};

export default EmailSentPage;