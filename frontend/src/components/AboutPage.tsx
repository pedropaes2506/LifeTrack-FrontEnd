import React from 'react';
import { Link } from 'react-router-dom';

import Header from './Header'; 
import Sidebar from './Sidebar';

import '../styles/App.css'; 
import '../styles/AboutPage.css'; 

const AboutPage: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="app-body-layout">
        <Sidebar />
        
        <main className="app-content-area">
          <div className="about-page-container">
            
            <header className="about-page-header">
              <h1>Sobre o LifeTrack</h1>
            </header>

            <section className="about-page-content">
              <h2 className="about-subtitle">Nossa Missão</h2>
              <p className="about-text">
                Ajudar pessoas a construírem hábitos saudáveis de forma simples e
                constante, transformando pequenas ações do dia a dia em grandes
                conquistas para o bem-estar físico e mental.
              </p>

              <h2 className="about-subtitle">Pequenos hábitos. Grandes mudanças</h2>
              <p className="about-text">
                Nosso objetivo é inspirar equilíbrio, autocuidado e evolução contínua um passo de cada vez.
              </p>
            </section>

            <footer className="about-page-footer">
              <Link to="/suporte" className="btn-support">
                <span className="btn-support-main-text">Precisa de ajuda?</span>
                <span>Fale com o suporte</span>
              </Link>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AboutPage;