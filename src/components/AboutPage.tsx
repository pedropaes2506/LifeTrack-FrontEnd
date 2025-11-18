import React from 'react';
import { Link } from 'react-router-dom';

// 1. Importa os componentes de layout
import Header from './Header'; // <--- ESTE É O IMPORT AVISANDO
import Sidebar from './Sidebar';

// 2. Importa os estilos
import '../styles/App.css'; 
import '../styles/AboutPage.css'; 

// 3. Componente da Página Sobre
const AboutPage: React.FC = () => {
  return (
    <div className="app-container">
      <Header /> {/* <-- DESCOMENTADO: AGORA ESTÁ SENDO USADO */}
      <div className="app-body-layout">
        <Sidebar />
        
        <main className="app-content-area">
          <div className="about-page-container">
            
            {/* Cabeçalho */}
            <header className="about-page-header">
              <h1>Sobre o LifeTrack</h1>
            </header>

            {/* Conteúdo de Texto */}
            <section className="about-page-content">
              <h2 className="about-subtitle">Nossa Missão</h2>
              <p className="about-text">
                Ajudar pessoas a construírem hábitos saudáveis de forma simples e
                constante, transformando pequenas ações do dia a dia em grandes
                conquistas para o bem-estar físico e mental.
              </p>

              <h2 className="about-subtitle">Pequenos hábitos. Grandes mudanças</h2>
              <p className="about-text">
                Nosso objetivo é inspirar equilíbrio, autocuidado e evolução contínua
                – um passo de cada vez.
              </p>
            </section>

            {/* Rodapé com Botão */}
            <footer className="about-page-footer">
              <Link to="/suporte" className="btn-support">
                Precisa de ajuda?
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