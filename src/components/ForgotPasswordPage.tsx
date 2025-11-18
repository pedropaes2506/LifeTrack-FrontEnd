import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header'; 
import '../styles/App.css'; 
import '../styles/Login.css'; 
import '../styles/AuthForm.css'; 

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Simulando envio de email de recuperação...");
        navigate('/email-enviado');
    };

    return (
        <div className="auth-form-container">
            <Header showActions={false} />
            
            <main className="auth-form-main">
                <div className="auth-card">
                    <form onSubmit={handleSubmit}>
                        <h2>Confirme seu email:</h2>
                        
                        <div className="input-group">
                            <input type="email" id="email" placeholder=" " required />
                            <label htmlFor="email">Email</label>
                        </div>

                        <button 
                            type="submit" 
                            className="button-base button-primary-dark auth-button"
                        >
                            Enviar
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ForgotPasswordPage;