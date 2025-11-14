import { PrismaClient } from '@prisma/client';
import express from 'express';
import { autenticarToken } from '../middleware.js'; 

const prisma = new PrismaClient();
const router = express.Router();

// Função para Mapear Unidade -> Botões de Consumo Rápido
function getAddButtons(tipoUnidade) {
    const unit = tipoUnidade ? tipoUnidade.toLowerCase() : '';
    
    switch (unit) {
        case 'ml':
            return [100, 250, 500];
        case 'minutos': 
        case 'min':
            return [15, 30, 45];
        case 'km':
            return [1, 3, 5];
        case 'unidade':
        case 'vezes':
            return [1, 2, 3];
        case 'horas': 
            return [0.5, 1, 1.5];
        default:
            return [1, 5, 10]; // Padrão
    }
}

// ⬅️ NOVO: Função para garantir que o dia anterior foi "fechado"
// Esta função é chamada na primeira requisição do dia (ou ao carregar a página)
// para calcular e persistir o status final (Completa/Incompleta) do dia anterior.
async function ensureDayClosure(prismaInstance, adesaoId, rotinaMeta) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    
    // 1. Encontrar o último dia com atividade, mas que é anterior a hoje.
    const ultimoRegistroAntesHoje = await prismaInstance.RegistroRotina.findFirst({
        where: {
            adesaoId: adesaoId,
            dataRegistro: {
                lt: hoje,
            }
        },
        orderBy: { dataRegistro: 'desc' },
    });
    
    if (!ultimoRegistroAntesHoje) {
        return; // Sem atividade anterior a hoje
    }

    const dataUltimoRegistro = ultimoRegistroAntesHoje.dataRegistro;
    dataUltimoRegistro.setHours(0, 0, 0, 0); // Dia que o último registro foi feito
    
    // 2. Encontrar o último registro de FECHAMENTO (onde metaCumprida não é NULL)
    const ultimoFechamento = await prismaInstance.RegistroRotina.findFirst({
        where: {
            adesaoId: adesaoId,
            metaCumprida: { not: null } 
        },
        orderBy: { dataRegistro: 'desc' },
    });
    
    let ultimoDiaFechado = new Date(0); 
    if (ultimoFechamento) {
        ultimoDiaFechado = ultimoFechamento.dataRegistro;
        ultimoDiaFechado.setHours(0, 0, 0, 0); 
    }
    
    // 3. Itera sobre os dias que tiveram atividade, mas que não foram fechados, até o dia anterior a hoje
    let diaAFechar = new Date(ultimoDiaFechado);
    // Se o último dia fechado é o início de tudo, começamos pelo primeiro dia de atividade
    if (diaAFechar.getTime() === new Date(0).getTime()) {
        diaAFechar = new Date(dataUltimoRegistro);
        diaAFechar.setHours(0, 0, 0, 0);
    } else {
         // Se o dia já foi fechado, move para o dia seguinte (último dia fechado + 1)
         diaAFechar.setDate(diaAFechar.getDate() + 1);
    }

    // Enquanto o dia a fechar for anterior a hoje.
    while (diaAFechar < hoje) {
        
        let diaFim = new Date(diaAFechar);
        diaFim.setDate(diaFim.getDate() + 1); // Fim do dia a fechar (00:00 do próximo dia)

        // Buscar todos os registros do dia a fechar
        const registrosDoDia = await prismaInstance.RegistroRotina.findMany({
            where: {
                adesaoId: adesaoId,
                dataRegistro: {
                    gte: diaAFechar,
                    lt: diaFim,
                },
            },
            select: { valorRegistro: true, metaCumprida: true }, 
        });
        
        // Se há registros e nenhum deles é um registro de fechamento (metaCumprida != null)
        const jaFechado = registrosDoDia.some(reg => reg.metaCumprida !== null);

        if (!jaFechado && registrosDoDia.length > 0) {
            
            // Calcula o total do dia
            const totalDia = registrosDoDia.reduce((sum, reg) => sum + (parseFloat(reg.valorRegistro) || 0), 0);
            const metaCompleta = totalDia >= rotinaMeta;

            // Criar o registro de FECHAMENTO (Metadado)
            // Data do fechamento: 23:59:59 do dia a fechar
            let dataFechamento = new Date(diaAFechar);
            dataFechamento.setHours(23, 59, 59, 999); 
            
            await prismaInstance.RegistroRotina.create({
                data: {
                    adesaoId: adesaoId,
                    valorRegistro: 0, // Valor 0, pois é apenas um metadado de fechamento
                    dataRegistro: dataFechamento, 
                    metaCumprida: metaCompleta, // Status final persistido
                },
            });
        }
        
        // Avança para o próximo dia.
        diaAFechar.setDate(diaAFechar.getDate() + 1);
    }
}


// Função utilitária AGORA INCLUI A LÓGICA DE HISTÓRICO DE 5 DIAS
async function getAdesaoHistory(prismaInstance, adesaoId, userId, rotinaNome, rotinaUnidade, rotinaMeta) {
    
    const addButtons = getAddButtons(rotinaUnidade);
    
    // ⬅️ CHAMA O FECHAMENTO DO DIA antes de qualquer cálculo de histórico
    await ensureDayClosure(prismaInstance, adesaoId, rotinaMeta);
    
    // --- Lógica de Data para o Registro Diário (HoJE) ---
    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0); 
    const hojeFim = new Date(hojeInicio);
    hojeFim.setDate(hojeFim.getDate() + 1); 
    
    // 1. Buscar TODOS os registros do dia ATUAL (apenas Deltas - metaCumprida: null)
    const registrosDiaDB = await prismaInstance.RegistroRotina.findMany({
        where: {
            adesaoId: adesaoId,
            dataRegistro: {
                gte: hojeInicio, 
                lt: hojeFim,     
            },
            metaCumprida: null, // Filtra para pegar apenas os registros de delta (não fechamento)
        },
        orderBy: { dataRegistro: 'asc' },
        select: {
            dataRegistro: true,
            valorRegistro: true,
        },
    });

    // Calcular o Progresso Atual (Soma de todos os registros)
    const currentProgress = registrosDiaDB.reduce((sum, reg) => sum + (parseFloat(reg.valorRegistro) || 0), 0);
    
    // Formatar Registros do Dia para o Frontend
    const registrosDiaFormatados = registrosDiaDB.map(reg => ({
        time: reg.dataRegistro.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
        value: reg.valorRegistro,
    }));
    
    // --- Lógica de Histórico dos Últimos 5 Dias (REAL) ---
    let historicoMetas = [];
    
    // Buscar a data de adesão para garantir que não buscamos antes do início
    const adesaoInfo = await prismaInstance.Adesao.findUnique({
        where: { id: adesaoId },
        select: { dataAdesao: true }
    });

    if (adesaoInfo) {
        const dataAdesaoInicio = adesaoInfo.dataAdesao;
        dataAdesaoInicio.setHours(0, 0, 0, 0);
        
        // Vamos iterar pelos últimos 5 dias, excluindo hoje
        for (let i = 1; i <= 5; i++) {
            let dia = new Date();
            dia.setDate(dia.getDate() - i); 
            dia.setHours(0, 0, 0, 0); 

            // Se o dia for anterior à adesão, paramos a contagem
            if (dia < dataAdesaoInicio) {
                break;
            }

            let diaFim = new Date(dia);
            diaFim.setDate(diaFim.getDate() + 1);

            // 3. Buscar o registro de FECHAMENTO do dia (o único com metaCumprida != null)
            const registroFechamento = await prismaInstance.RegistroRotina.findFirst({
                where: {
                    adesaoId: adesaoId,
                    dataRegistro: {
                        gte: dia,
                        lt: diaFim,
                    },
                    metaCumprida: { not: null }, // Busca o registro de metadados
                },
                orderBy: { dataRegistro: 'desc' },
            });


            // Se encontrou o fechamento, usa o status persistido
            if (registroFechamento) {
                const metaCompleta = registroFechamento.metaCumprida;
                const dataFormatada = dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                historicoMetas.push({
                    date: dataFormatada,
                    status: metaCompleta ? 'Completa' : 'Incompleta', // Usa o status persistido
                    isComplete: metaCompleta,
                });
            }
            // Se não encontrou o fechamento, o dia não teve atividade. A UX pode ignorar ou mostrar como incompleto.
            // Para simplicidade, vamos apenas incluir dias que tiveram fechamento (ou seja, atividade).
        }
    }
    
    return {
        current: currentProgress,
        addButtons,
        registrosDia: registrosDiaFormatados, 
        historicoMetas, 
    };
}


// ROTA EXISTENTE: Buscar Perfil do Usuário Logado
router.get('/perfil', autenticarToken, async (req, res) => {
    try {
        const user = await prisma.User.findUnique({ 
            where: { email: req.user.email },
            select: { id: true, email: true, nome: true } 
        });
        
        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

        res.json({ id: user.id, email: user.email, nome: user.nome });
    } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        res.status(500).json({ message: "Erro ao buscar perfil." });
    }
});

// NOVA ROTA: Listar todas as rotinas mestres disponíveis
router.get('/rotinas/disponiveis', autenticarToken, async (req, res) => {
    try {
        const rotinas = await prisma.Rotina.findMany({ 
            where: { ativa: true }, 
            select: {
                id: true,
                nome: true,
                metaValorPadrao: true,
                tipoUnidade: true,
            }
        });
        res.json(rotinas);
    } catch (err) {
        console.error("Erro ao listar rotinas disponíveis:", err);
        res.status(500).json({ message: "Erro ao listar rotinas disponíveis." });
    }
});

// NOVA ROTA: Obter as rotinas que o usuário já aderiu
router.get('/rotinas/minhas', autenticarToken, async (req, res) => {
    try {
        const user = await prisma.User.findUnique({ 
            where: { email: req.user.email }, 
            select: { id: true } 
        });

        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

        const minhasRotinas = await prisma.Adesao.findMany({ 
            where: { 
                usuarioId: user.id,
                statusAdesao: true 
            },
            select: {
                id: true,
                metaPessoalValor: true,
                rotina: {
                    select: {
                        id: true,
                        nome: true,
                        tipoUnidade: true,
                    }
                }
            }
        });
        
        const rotinasFormatadas = await Promise.all(minhasRotinas.map(async (adesao) => {
            const historyData = await getAdesaoHistory(
                prisma, 
                adesao.id, 
                user.id, 
                adesao.rotina.nome, 
                adesao.rotina.tipoUnidade, 
                adesao.metaPessoalValor
            );
            
            return {
                adesaoId: adesao.id,
                nome: adesao.rotina.nome,
                meta: adesao.metaPessoalValor,
                unidade: adesao.rotina.tipoUnidade,
                current: historyData.current, 
                streak: 5 
            };
        }));

        res.json(rotinasFormatadas);

    } catch (err) {
        console.error("Erro ao listar minhas rotinas:", err);
        res.status(500).json({ message: "Erro ao listar as rotinas do usuário." });
    }
});

// ROTA PARA ActivityPage: Buscar detalhes de uma adesão específica
router.get('/rotinas/adesao/:adesaoId', autenticarToken, async (req, res) => {
    const { adesaoId } = req.params;
    
    try {
        const user = await prisma.User.findUnique({ 
            where: { email: req.user.email }, 
            select: { id: true } 
        });
        
        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

        const adesao = await prisma.Adesao.findFirst({
            where: {
                id: parseInt(adesaoId),
                usuarioId: user.id, 
            },
            select: {
                id: true,
                metaPessoalValor: true,
                rotina: {
                    select: {
                        nome: true,
                        tipoUnidade: true,
                    }
                }
            },
        });

        if (!adesao) {
            return res.status(404).json({ message: "Rotina não encontrada ou acesso negado." });
        }
        
        // Buscar dados de progresso e histórico reais/simulados
        const historyData = await getAdesaoHistory(
            prisma, 
            adesao.id, 
            user.id, 
            adesao.rotina.nome, 
            adesao.rotina.tipoUnidade, 
            adesao.metaPessoalValor
        );

        // Formata a resposta
        const rotinaDetalhe = {
            adesaoId: adesao.id,
            nome: adesao.rotina.nome,
            unidade: adesao.rotina.tipoUnidade,
            meta: adesao.metaPessoalValor,
            
            current: historyData.current,
            addButtons: historyData.addButtons,
            registrosDia: historyData.registrosDia, 
            historicoMetas: historyData.historicoMetas, 
        };

        return res.json(rotinaDetalhe);

    } catch (error) {
        console.error(`Erro ao buscar detalhes da adesão ${adesaoId}:`, error);
        return res.status(500).json({ message: "Erro interno ao carregar detalhes da rotina." });
    }
});

// ROTA para atualizar a meta pessoal (EditGoalModal)
router.put('/rotinas/meta/:adesaoId', autenticarToken, async (req, res) => {
    const { adesaoId } = req.params;
    const { meta } = req.body;
    
    try {
        const user = await prisma.User.findUnique({ 
            where: { email: req.user.email }, 
            select: { id: true } 
        });
        
        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

        if (typeof meta !== 'number' || meta <= 0) {
            return res.status(400).json({ message: "Meta deve ser um valor positivo." });
        }

        const adesaoAtualizada = await prisma.Adesao.updateMany({
            where: {
                id: parseInt(adesaoId),
                usuarioId: user.id, 
            },
            data: {
                metaPessoalValor: meta,
            },
        });

        if (adesaoAtualizada.count === 0) {
            return res.status(404).json({ message: "Adesão à rotina não encontrada ou acesso negado." });
        }

        return res.json({ message: "Meta atualizada com sucesso." });

    } catch (error) {
        console.error(`Erro ao atualizar meta da adesão ${adesaoId}:`, error);
        return res.status(500).json({ message: "Erro interno ao atualizar a meta." });
    }
});


// ROTA para registrar o progresso diário (ActivityPage) - AGORA O FECHAMENTO DO DIA É AUTOMÁTICO
router.post('/registros/registrar', autenticarToken, async (req, res) => {
    const { adesaoId, valorConsumido } = req.body; 

    try {
        const user = await prisma.User.findUnique({ 
            where: { email: req.user.email }, 
            select: { id: true } 
        });
        
        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

        if (typeof valorConsumido !== 'number') { 
            return res.status(400).json({ message: "Valor de consumo inválido." });
        }
        
        const idAdesao = parseInt(adesaoId);
        
        // 1. Verifica se a adesão pertence ao usuário (segurança)
        const adesao = await prisma.Adesao.findFirst({
            where: { id: idAdesao, usuarioId: user.id },
        });

        if (!adesao) {
            return res.status(404).json({ message: "Adesão não encontrada." });
        }
        
        // 2. Sempre cria um NOVO registro com o valor do DELTA
        // Importante: metaCumprida é null para um delta, indicando que não é um registro de fechamento de dia.
        const registro = await prisma.RegistroRotina.create({
            data: {
                adesaoId: idAdesao,
                valorRegistro: valorConsumido, 
                dataRegistro: new Date(), 
                metaCumprida: null, 
            },
        });
        
        return res.json({ message: "Registro de consumo adicionado com sucesso.", registro });

    } catch (error) {
        console.error("Erro ao registrar progresso:", error);
        return res.status(500).json({ message: "Erro interno ao salvar o progresso." });
    }
});


// ROTA EXISTENTE: Adesão a uma Rotina
router.post('/rotinas/aderir', autenticarToken, async (req, res) => {
    try {
        const { rotinaId, metaPessoalValor } = req.body;

        if (!rotinaId || metaPessoalValor === undefined) {
            return res.status(400).json({ message: "ID da rotina e valor da meta são obrigatórios." });
        }
        
        // 1. Encontrar o ID do usuário logado
        const user = await prisma.User.findUnique({ 
            where: { email: req.user.email }, 
            select: { id: true } 
        });

        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

        // Garante que o metaPessoalValor é um número
        const metaValue = parseFloat(metaPessoalValor);
        if (isNaN(metaValue) || metaValue <= 0) {
            return res.status(400).json({ message: "O valor da meta deve ser um número positivo." });
        }


        // 2. Tentar criar a adesão
        const novaAdesao = await prisma.Adesao.create({
            data: {
                usuarioId: user.id,
                rotinaId: rotinaId,
                metaPessoalValor: metaValue,
                statusAdesao: true,
            }
        });

        res.status(201).json({ 
            message: "Rotina adicionada com sucesso!", 
            adesaoId: novaAdesao.id
        });

    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ message: "Você já está aderido a esta rotina." });
        }
        console.error("Erro ao aderir à rotina:", err);
        res.status(500).json({ message: "Erro ao aderir à rotina." });
    }
});

export default router;