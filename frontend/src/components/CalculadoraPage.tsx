import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/CalculadoraPage.css';

interface ResultadoIMC {
    imc: number;
    classificacao: string;
    hidratacao: number;
}

const Calculadora: React.FC = () => {
    const [peso, setPeso] = useState<string>('');
    const [altura, setAltura] = useState<string>('');
    const [resultado, setResultado] = useState<ResultadoIMC | null>(null);

    const calcularIMC = (e: React.FormEvent) => {
        e.preventDefault();
        
        const pesoNum = parseFloat(peso.replace(',', '.'));
        const alturaNum = parseFloat(altura.replace(',', '.'));

        // Validações
        if (!pesoNum || !alturaNum || pesoNum <= 0 || alturaNum <= 0) {
            alert('Por favor, insira valores válidos para peso e altura.');
            return;
        }

        if (alturaNum > 300) {
            alert('Por favor, insira a altura em centímetros (ex: 175 para 1,75m)');
            return;
        }

        // Converter altura de cm para metros
        const alturaMetros = alturaNum / 100;
        
        // Calcular IMC
        const imc = pesoNum / (alturaMetros * alturaMetros);
        const imcArredondado = Math.round(imc * 10) / 10;

        // Determinar classificação
        let classificacao = '';
        if (imc < 18.5) {
            classificacao = 'Abaixo do peso';
        } else if (imc < 25) {
            classificacao = 'Peso normal';
        } else if (imc < 30) {
            classificacao = 'Sobrepeso';
        } else if (imc < 35) {
            classificacao = 'Obesidade Grau I';
        } else if (imc < 40) {
            classificacao = 'Obesidade Grau II';
        } else {
            classificacao = 'Obesidade Grau III';
        }

        // Calcular hidratação recomendada (35ml por kg)
        const hidratacao = Math.round(pesoNum * 35);

        setResultado({
            imc: imcArredondado,
            classificacao,
            hidratacao
        });
    };

    const limparCampos = () => {
        setPeso('');
        setAltura('');
        setResultado(null);
    };

    return (
        <div className="dashboard-layout">
            <Header />
            <Sidebar />
            
            <main className="dashboard-main-content">
                <div className="calculadora-container">
                    {/* COLUNA ESQUERDA - CALCULADORA */}
                    <div className="coluna-esquerda">
                        <h1 className="titulo-principal">Calculadora de Saúde</h1>

                        <form className="formulario-imc" onSubmit={calcularIMC}>
                            <div className="campo-form">
                                <label htmlFor="peso">Peso (kg):</label>
                                <input 
                                    type="number" 
                                    id="peso"
                                    value={peso}
                                    onChange={(e) => setPeso(e.target.value)}
                                    placeholder="Ex: 70"
                                    step="0.1"
                                    min="1"
                                    max="300"
                                    required
                                />
                            </div>
                            
                            <div className="campo-form">
                                <label htmlFor="altura">Altura (cm):</label>
                                <input 
                                    type="number" 
                                    id="altura"
                                    value={altura}
                                    onChange={(e) => setAltura(e.target.value)}
                                    placeholder="Ex: 175"
                                    min="50"
                                    max="250"
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" className="botao-calcular">
                                    Calcular ou atualizar
                                </button>
                                <button 
                                    type="button" 
                                    className="botao-calcular"
                                    onClick={limparCampos}
                                    style={{ background: '#6c757d' }}
                                >
                                    Limpar
                                </button>
                            </div>
                        </form>

                        {/* RESULTADOS - APENAS SE HOUVER CÁLCULO */}
                        {resultado && (
                            <div className="resultados-imc">
                                <h2>Resultados</h2>
                                
                                <div className="item-resultado">
                                    <strong>Valor do IMC:</strong>
                                    <span className="valor-imc">{resultado.imc}</span>
                                </div>
                                
                                <div className="item-resultado">
                                    <strong>Classificação:</strong>
                                    <span className="classificacao-imc">{resultado.classificacao}</span>
                                </div>

                                <div className="hidratacao-texto">
                                    Hidratação diária recomendada: {resultado.hidratacao}ml
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLUNA DIREITA - INFORMAÇÕES SOBRE IMC */}
                    <div className="coluna-direita">
                        <div className="informacoes-imc">
                            <h3>Sobre o IMC</h3>
                            <p className="texto-info">
                                O Índice de Massa Corporal é um parâmetro utilizado pela OMS para avaliar se o peso está adequado à altura de uma pessoa.
                            </p>

                            <h4>Classificação do IMC</h4>
                            <ul className="lista-classificacao">
                                <li>Abaixo do peso: &lt; 18,5</li>
                                <li>Peso normal: 18,5 - 24,9</li>
                                <li>Sobrepeso: 25 - 29,9</li>
                                <li>Obesidade Grau I: 30 - 34,9</li>
                                <li>Obesidade Grau II: 35 - 39,9</li>
                                <li>Obesidade Grau III: ≥ 40</li>
                            </ul>

                            <h4>Quantidade de água ideal</h4>
                            <p className="texto-info">
                                A hidratação adequada é essencial para o bom funcionamento do organismo e influencia diretamente no metabolismo e no equilíbrio do IMC.
                                A recomendação é de 35ml de água por kg de peso corporal.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Calculadora;