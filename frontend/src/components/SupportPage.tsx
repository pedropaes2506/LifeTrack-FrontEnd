import React, { useState } from 'react';

// Importa os componentes de layout
import Header from './Header'; 
import Sidebar from './Sidebar';

// Importa os estilos
import '../styles/App.css'; 
import '../styles/SupportPage.css'; // Novo arquivo de estilo

// Dados mockados das perguntas frequentes (FAQ)
const faqData = [
    {
        id: 1,
        question: "Como eu edito a minha meta?",
        answer: (
            <ul>
                <li>1. Acesse o Dashboard: Vá para a página inicial (Home).</li>
                <li>2. Clique no Hábito: Selecione o cartão do hábito que deseja modificar.</li>
                <li>3. Edite a Meta: No modal de detalhes, clique no ícone de lápis ou em "Editar".</li>
                <li>4. Salve: Insira o novo valor da meta e salve as alterações.</li>
            </ul>
        )
    },
    {
        id: 2,
        question: "Como removo um hábito?",
        answer: (
            <ul>
                <li>1. Vá para Admin: Navegue até Gerenciar Hábitos (seção de Admin).</li>
                <li>2. Localize: Encontre o hábito que você deseja remover na lista.</li>
                <li>3. Clique na Lixeira: Clique no ícone de lixeira (Excluir).</li>
                <li>4. Confirme: Confirme a ação no modal pop-up. **Atenção:** Esta ação é permanente.</li>
            </ul>
        )
    },
];

// Ícone de seta (para as perguntas)
const ArrowIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        height="18" 
        viewBox="0 0 24 24" 
        width="18" 
        fill="currentColor"
        className={`arrow-icon ${isOpen ? 'open' : ''}`} // Adiciona classe para rotação
    >
        <path d="M0 0h24v24H0z" fill="none"/><path d="M7 14l5-5 5 5z"/>
    </svg>
);


const SupportPage: React.FC = () => {
    // Estado para controlar qual pergunta (ID) está aberta
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);

    const [assunto, setAssunto] = useState('');
    const [mensagem, setMensagem] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Mensagem enviada! Assunto: ${assunto}, Mensagem: ${mensagem}`);
        setAssunto('');
        setMensagem('');
    };

    const toggleAnswer = (id: number) => {
        // Se a pergunta clicada já estiver aberta, fecha. Senão, abre a nova.
        setOpenQuestion(openQuestion === id ? null : id);
    };


    return (
        <div className="app-container">
            <Header />
            <div className="app-body-layout">
                <Sidebar />
                
                <main className="app-content-area">
                    <div className="support-page-container">
                        
                        <header className="support-page-header">
                            <h1>Suporte e Ajuda</h1>
                        </header>

                        {/* Seção 1: Perguntas Frequentes (FAQ) */}
                        <section className="faq-section">
                            <h2 className="section-title">Perguntas Frequentes</h2>
                            
                            {faqData.map(item => (
                                <div key={item.id} className="faq-group">
                                    <div 
                                        className="faq-item"
                                        onClick={() => toggleAnswer(item.id)} // Adiciona o evento de clique
                                    >
                                        <span className="faq-question">{item.question}</span>
                                        <ArrowIcon isOpen={openQuestion === item.id} />
                                    </div>
                                    
                                    {/* NOVO: Conteúdo da resposta (só aparece se estiver aberto) */}
                                    {openQuestion === item.id && (
                                        <div className="faq-answer">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>

                        {/* Seção 2: Formulário de Contato */}
                        <section className="contact-section">
                            <h2 className="section-title">Contatar Suporte</h2>
                            <p className="contact-subtitle">Não encontrou o que procurava? Nos envie uma mensagem:</p>
                            
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="assunto">Assunto:</label>
                                    <input 
                                        id="assunto" 
                                        type="text" 
                                        value={assunto}
                                        onChange={(e) => setAssunto(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="mensagem">Mensagem:</label>
                                    <textarea 
                                        id="mensagem" 
                                        value={mensagem}
                                        onChange={(e) => setMensagem(e.target.value)}
                                        rows={4} 
                                        required
                                    />
                                </div>
                                
                                <button type="submit" className="btn-send-message">
                                    Enviar Mensagem
                                </button>
                            </form>
                        </section>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default SupportPage;