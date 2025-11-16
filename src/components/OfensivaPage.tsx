import React from 'react';

// Imports de Componentes e Estilos
import Header from './Header'; 
import Sidebar from './Sidebar';
import '../styles/App.css'; // Estilos de layout
import '../styles/OfensivaPage.css'; // Estilos específicos

// Dados dos dias (adaptados para a imagem da Ofensiva)
const days = [
  { day: '26', month: 'other' }, { day: '27', month: 'other' }, { day: '28', month: 'other' },
  { day: '29', month: 'other' }, { day: '30', month: 'other' }, { day: '31', month: 'other' },
  { day: '1', month: 'current' }, 
  { day: '2', month: 'current', highlight: 'blue' }, 
  { day: '3', month: 'current', highlight: 'blue' }, 
  { day: '4', month: 'current', highlight: 'blue' }, 
  { day: '5', month: 'current', highlight: 'blue' }, 
  { day: '6', month: 'current', highlight: 'blue' }, 
  { day: '7', month: 'current', highlight: 'blue', isToday: true }, 
  { day: '8', month: 'current' },
  { day: '9', month: 'current' }, { day: '10', month: 'current' }, { day: '11', month: 'current' },
  { day: '12', month: 'current' }, { day: '13', month: 'current' }, { day: '14', month: 'current' },
  { day: '15', month: 'current' }, { day: '16', month: 'current' }, { day: '17', month: 'current' },
  { day: '18', month: 'current' }, { day: '19', month: 'current' }, { day: '20', month: 'current' },
  { day: '21', month: 'current' }, { day: '22', month: 'current' }, { day: '23', month: 'current' },
  { day: '24', month: 'current' }, { day: '25', month: 'current' }, { day: '26', month: 'current' },
  { day: '27', month: 'current' }, { day: '28', month: 'current' }, { day: '29', month: 'current' },
  { day: '30', month: 'current' }, 
  { day: '1', month: 'other' }, { day: '2', month: 'other' }, { day: '3', month: 'other' },
  { day: '4', month: 'other' }, { day: '5', month: 'other' }, { day: '6', month: 'other' },
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const OfensivaPage: React.FC = () => {
  
  const getDayClassName = (day: (typeof days)[0]) => {
    let classNames = ['ofensiva-day']; 
    if (day.month === 'other') classNames.push('ofensiva-day-other-month');
    if (day.highlight === 'blue') classNames.push('ofensiva-day-highlight-blue');
    if (day.isToday) classNames.push('ofensiva-day-today');
    return classNames.join(' ');
  };

  return (
    <div className="app-container">
      <Header />
      <div className="app-body-layout">
        <Sidebar />
        
        <main className="app-content-area">
          <div className="ofensiva-page-container">
            <header className="ofensiva-page-header">
              <div className="ofensiva-page-title-group">
                <h1>Ofensiva</h1>
                <p>Acompanhe sua ofensiva:</p>
              </div>
              {/* O card "6 dias de ofensiva" foi REMOVIDO daqui */}
            </header>

            <div className="ofensiva-main-content">
              <div className="ofensiva-widget-container">
                
                {/* Card de ofensiva FOI MOVIDO PARA CÁ */}
                <div className="ofensiva-days-card">
                  <span role="img" aria-label="joinha" className="ofensiva-thumb-icon">👍</span>
                  <span>6 dias de ofensiva</span>
                </div>
                
                <div className="ofensiva-widget-header">
                  <button className="ofensiva-nav-button">&lt;</button>
                  <h2>Novembro 2025</h2>
                  <button className="ofensiva-nav-button">&gt;</button>
                </div>
                <div className="ofensiva-widget-grid">
                  {weekDays.map((dayName) => (
                    <div key={dayName} className="ofensiva-day-header">
                      {dayName}
                    </div>
                  ))}
                  {days.map((day, index) => (
                    <div key={index} className={getDayClassName(day)}>
                      {day.day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OfensivaPage;