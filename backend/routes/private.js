import { PrismaClient } from '@prisma/client';
import express from 'express';
import { autenticarToken } from '../middleware.js'; 
import bcrypt from 'bcrypt'; 
import { enviarEmail } from './mail.js';

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

async function ensureDayClosure(prismaInstance, adesaoId, rotinaMeta) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    
    const ultimoRegistroAntesHoje = await prismaInstance.RegistroRotina.findFirst({
        where: {
            adesaoId: adesaoId,
            dataRegistro: { lt: hoje }
        },
        orderBy: { dataRegistro: 'desc' },
    });
    
    if (!ultimoRegistroAntesHoje) {
        return; 
    }

    const dataUltimoRegistro = ultimoRegistroAntesHoje.dataRegistro;
    dataUltimoRegistro.setHours(0, 0, 0, 0); 
    
    const ultimoFechamento = await prismaInstance.RegistroRotina.findFirst({
        where: { adesaoId: adesaoId, metaCumprida: { not: null } },
        orderBy: { dataRegistro: 'desc' },
    });
    
    let ultimoDiaFechado = new Date(0); 
    if (ultimoFechamento) {
        ultimoDiaFechado = ultimoFechamento.dataRegistro;
        ultimoDiaFechado.setHours(0, 0, 0, 0); 
    }
    
    let diaAFechar = new Date(ultimoDiaFechado);
    
    if (diaAFechar.getTime() === new Date(0).getTime()) {
        diaAFechar = new Date(dataUltimoRegistro);
        diaAFechar.setHours(0, 0, 0, 0);
    } else {
         diaAFechar.setDate(diaAFechar.getDate() + 1);
    }

    while (diaAFechar < hoje) {
        
        let diaFim = new Date(diaAFechar);
        diaFim.setDate(diaFim.getDate() + 1); 

        const registrosDoDia = await prismaInstance.RegistroRotina.findMany({
            where: {
                adesaoId: adesaoId,
                dataRegistro: { gte: diaAFechar, lt: diaFim }
            },
            select: { valorRegistro: true, metaCumprida: true }, 
        });
        
        const jaFechado = registrosDoDia.some(reg => reg.metaCumprida !== null);

        if (!jaFechado && registrosDoDia.length > 0) {
            
            const totalDia = registrosDoDia.reduce((sum, reg) => sum + (parseFloat(reg.valorRegistro) || 0), 0);
            const metaCompleta = totalDia >= rotinaMeta;

            let dataFechamento = new Date(diaAFechar);
            dataFechamento.setHours(23, 59, 59, 999); 
            
            await prismaInstance.RegistroRotina.create({
                data: {
                    adesaoId: adesaoId,
                    valorRegistro: 0, 
                    dataRegistro: dataFechamento, 
                    metaCumprida: metaCompleta, 
                },
            });
        }
        
        diaAFechar.setDate(diaAFechar.getDate() + 1);
    }
}


async function calculateDailyProgressSummary(prismaInstance, userId, date) {
    const inicioDia = new Date(date);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(inicioDia);
    fimDia.setDate(fimDia.getDate() + 1);

    const adesoes = await prismaInstance.Adesao.findMany({
        where: {
            usuarioId: userId,
            statusAdesao: true,
            dataAdesao: { lt: fimDia } 
        },
        select: { id: true, metaPessoalValor: true }
    });

    if (adesoes.length === 0) {
        return { status: 'none' }; 
    }

    let completedGoals = 0;
    const totalGoals = adesoes.length;
    
    const progressoPromessas = adesoes.map(async (adesao) => {
        
        const registrosDoDia = await prismaInstance.RegistroRotina.findMany({
            where: {
                adesaoId: adesao.id,
                dataRegistro: { gte: inicioDia, lt: fimDia },
                metaCumprida: null, 
            },
            select: { valorRegistro: true },
        });

        const totalConsumido = registrosDoDia.reduce((sum, reg) => sum + (parseFloat(reg.valorRegistro) || 0), 0);
        return totalConsumido >= adesao.metaPessoalValor;
    });

    const resultados = await Promise.all(progressoPromessas);

    resultados.forEach(isComplete => {
        if (isComplete) {
            completedGoals++;
        }
    });

    let status = 'none';
    if (totalGoals > 0) {
        if (completedGoals === 0) { 
            status = 'vermelho';
        } else if (completedGoals === totalGoals) { 
            status = 'verde';
        } else { 
            status = 'amarelo';
        }
    }
    
    return { status };
}

async function getGlobalStreakSummary(prismaInstance, userId, targetDate) {
    let currentStreakCount = 0;
    let streakDays = [];
    let dayCursor = new Date(targetDate);
    dayCursor.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const MAX_DAYS_CHECK = 365; 

    for (let i = 0; i < MAX_DAYS_CHECK; i++) {
        
        if (dayCursor > today) { // Não verifica dias futuros
            dayCursor.setDate(dayCursor.getDate() - 1); 
            continue;
        }

        const summary = await calculateDailyProgressSummary(prismaInstance, userId, dayCursor);
        const dayKey = `${dayCursor.getFullYear()}-${String(dayCursor.getMonth() + 1).padStart(2, '0')}-${String(dayCursor.getDate()).padStart(2, '0')}`;
        
        if (summary.status === 'verde' || summary.status === 'amarelo') {
            currentStreakCount++;
            streakDays.push(dayKey);
        } else if (summary.status === 'vermelho') { 
            break; 
        } else if (summary.status === 'none') {
             if (currentStreakCount > 0) break; 
        }
        
        dayCursor.setDate(dayCursor.getDate() - 1); 
    }
    
    streakDays.reverse();

    return { 
        count: currentStreakCount, 
        streakDays: streakDays 
    };
}

async function getAdesaoHistory(prismaInstance, adesaoId, userId, rotinaNome, rotinaUnidade, rotinaMeta) {
    
    const addButtons = getAddButtons(rotinaUnidade);
    
    await ensureDayClosure(prismaInstance, adesaoId, rotinaMeta);
    
    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0); 
    const hojeFim = new Date(hojeInicio);
    hojeFim.setDate(hojeFim.getDate() + 1); 
    
    // 1. Buscar TODOS os registros do dia ATUAL
    const registrosDiaDB = await prismaInstance.RegistroRotina.findMany({
        where: {
            adesaoId: adesaoId,
            dataRegistro: { gte: hojeInicio, lt: hojeFim },
            metaCumprida: null, 
        },
        orderBy: { dataRegistro: 'asc' },
        select: { dataRegistro: true, valorRegistro: true },
    });

    const currentProgress = registrosDiaDB.reduce((sum, reg) => sum + (parseFloat(reg.valorRegistro) || 0), 0);
    
    const registrosDiaFormatados = registrosDiaDB.map(reg => ({
        time: reg.dataRegistro.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
        value: reg.valorRegistro,
    }));
    
    let historicoMetas = [];
    
    const adesaoInfo = await prismaInstance.Adesao.findUnique({
        where: { id: adesaoId },
        select: { dataAdesao: true }
    });

    if (adesaoInfo) {
        const dataAdesaoInicio = adesaoInfo.dataAdesao;
        dataAdesaoInicio.setHours(0, 0, 0, 0);
        
        for (let i = 1; i <= 5; i++) {
            let dia = new Date();
            dia.setDate(dia.getDate() - i); 
            dia.setHours(0, 0, 0, 0); 

            if (dia < dataAdesaoInicio) {
                break;
            }

            let diaFim = new Date(dia);
            diaFim.setDate(diaFim.getDate() + 1);

            const registroFechamento = await prismaInstance.RegistroRotina.findFirst({
                where: {
                    adesaoId: adesaoId,
                    dataRegistro: { gte: dia, lt: diaFim },
                    metaCumprida: { not: null }, 
                },
                orderBy: { dataRegistro: 'desc' },
            });

            if (registroFechamento) {
                const metaCompleta = registroFechamento.metaCumprida;
                const dataFormatada = dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                historicoMetas.push({
                    date: dataFormatada,
                    status: metaCompleta ? 'Completa' : 'Incompleta', 
                    isComplete: metaCompleta,
                });
            }
        }
    }
    
    return {
        current: currentProgress,
        addButtons,
        registrosDia: registrosDiaFormatados, 
        historicoMetas, 
    };
}

router.post('/suporte/enviar-mensagem', autenticarToken, async (req, res) => {
    const userId = req.user.id;
    const { assunto, mensagem } = req.body;
    
    if (!assunto || !mensagem) {
        return res.status(400).json({ message: "Assunto e mensagem são obrigatórios." });
    }
    
    try {
        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            select: { email: true, nome: true }
        });
        
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const remetenteEmail = user.email; 
        
        const destinatarioSuporte = process.env.SMTP_USER; 
        
        const corpoEmail = `
            Nova mensagem de suporte de: ${user.nome} (${remetenteEmail})
            Assunto: ${assunto}
            
            --------------------------------------
            Mensagem:
            ${mensagem}
            --------------------------------------
        `;
        
        await enviarEmail(
            destinatarioSuporte,
            `[LifeTrack Suporte] ${assunto}`,
            corpoEmail
        );
        
        res.json({ message: "Mensagem enviada com sucesso! Em breve entraremos em contato." });

    } catch (err) {
        console.error("Erro ao enviar email de suporte:", err);
        res.status(500).json({ message: "Erro interno ao enviar a mensagem de suporte." });
    }
});


router.get('/progress/streak-summary', autenticarToken, async (req, res) => {
    const userId = req.user.id; 
    const today = new Date();
    
    try {
        const summary = await getGlobalStreakSummary(prisma, userId, today);
        
        res.json(summary);
    } catch (err) {
        console.error("Erro ao buscar resumo da ofensiva global:", err);
        res.status(500).json({ message: "Erro interno ao buscar dados da ofensiva." });
    }
});


router.get('/calendar/monthly-summary', autenticarToken, async (req, res) => {
    const userId = req.user.id; 
    const { ano, mes } = req.query; 
    
    if (!ano || !mes) {
        return res.status(400).json({ message: "Ano e Mês são obrigatórios." });
    }
    
    try {
        const anoNum = parseInt(ano); 
        const mesNum = parseInt(mes);
        
        const resumoMensal = {}; 
        
        const promises = [];
        
        for (let dia = 1; dia <= fimMes; dia++) {
            const dataDia = new Date(anoNum, mesNum - 1, dia);
            
            promises.push(
                calculateDailyProgressSummary(prisma, userId, dataDia).then(summary => {
                    const dataKey = `${anoNum}-${String(mesNum).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                    if (dataDia <= new Date()) {
                         resumoMensal[dataKey] = {
                            status: summary.status
                        };
                    }
                })
            );
        }
        
        await Promise.all(promises);

        res.json(resumoMensal);

    } catch (err) {
        console.error("Erro ao buscar resumo mensal:", err);
        res.status(500).json({ message: "Erro interno ao buscar dados do calendário." });
    }
});


router.get('/calendar/daily-detail', autenticarToken, async (req, res) => {
    const userId = req.user.id; 
    const { data } = req.query; // data: YYYY-MM-DD
    
    if (!data) {
        return res.status(400).json({ message: "Data é obrigatória." });
    }
    
    try {
        const dataDia = new Date(data); 
        
        const inicioDia = new Date(dataDia);
        inicioDia.setHours(0, 0, 0, 0);
        const fimDia = new Date(inicioDia);
        fimDia.setDate(fimDia.getDate() + 1);

        const adesoes = await prisma.Adesao.findMany({
            where: {
                usuarioId: userId,
                statusAdesao: true,
                dataAdesao: { lt: fimDia } 
            },
            select: {
                id: true,
                metaPessoalValor: true,
                rotina: { select: { nome: true, tipoUnidade: true } }
            }
        });

        if (adesoes.length === 0) {
            return res.json({ 
                dataSelecionada: dataDia.toLocaleDateString('pt-BR'), 
                totalPorcentagem: 0, 
                habitos: [] 
            });
        }
        
        let totalProgress = 0;
        
        const habitosDetalhe = await Promise.all(adesoes.map(async (adesao) => {
            const registrosDoDia = await prisma.RegistroRotina.findMany({
                where: {
                    adesaoId: adesao.id,
                    dataRegistro: { gte: inicioDia, lt: fimDia },
                    metaCumprida: null, // Apenas deltas
                },
                select: { valorRegistro: true },
            });
            
            const totalConsumido = registrosDoDia.reduce((sum, reg) => sum + (parseFloat(reg.valorRegistro) || 0), 0);
            
            const porcentagem = adesao.metaPessoalValor > 0 ? Math.min(Math.round((totalConsumido / adesao.metaPessoalValor) * 100), 100) : 100;

            totalProgress += porcentagem;

            return {
                nome: adesao.rotina.nome,
                porcentagem: porcentagem,
                concluido: porcentagem >= 100,
            };
        }));
        
        const averageProgress = habitosDetalhe.length > 0 ? (totalProgress / habitosDetalhe.length) : 0;
        
        res.json({
            dataSelecionada: dataDia.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
            totalPorcentagem: Math.round(averageProgress),
            habitos: habitosDetalhe,
        });

    } catch (error) {
        console.error("Erro ao buscar detalhes diários:", error);
        return res.status(500).json({ message: "Erro interno ao buscar detalhes do dia." });
    }
});


router.get('/perfil', autenticarToken, async (req, res) => {
    try {
        const user = await prisma.User.findUnique({ 
            where: { id: req.user.id },
            select: { 
                id: true, 
                email: true, 
                nome: true,
                sexo: true,
                dataNascimento: true,
            } 
        });
        
        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });
        
        const dataFormatada = user.dataNascimento ? 
            new Date(user.dataNascimento).toISOString().split('T')[0] : 
            '';

        res.json({ 
            id: user.id, 
            email: user.email, 
            nomeCompleto: user.nome,
            sexo: user.sexo || '', 
            dataNascimento: dataFormatada,
        });
    } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        res.status(500).json({ message: "Erro ao buscar perfil." });
    }
});

router.put('/perfil', autenticarToken, async (req, res) => {
    const userId = req.user.id; 
    const { nomeCompleto, sexo, dataNascimento } = req.body;
    
    try {
        const updatedData = {};

        if (nomeCompleto !== undefined && nomeCompleto !== null && nomeCompleto.trim() !== "") {
            updatedData.nome = nomeCompleto.trim();
        }

        if (sexo !== undefined) {
            updatedData.sexo = sexo.trim() === '' ? null : sexo;
        }

        if (dataNascimento !== undefined && dataNascimento.trim() !== "") {
            updatedData.dataNascimento = new Date(dataNascimento);
        } 


        if (Object.keys(updatedData).length === 0) {
             return res.status(400).json({ message: "Nenhum dado válido para atualização foi fornecido." });
        }


        const user = await prisma.User.update({ 
            where: { id: userId }, 
            data: updatedData, 
            select: { id: true, email: true, nome: true }
        });

        res.json({ message: "Perfil atualizado com sucesso.", user });

    } catch (err) {
        console.error("Erro ao atualizar perfil:", err); 
        res.status(500).json({ message: "Erro ao atualizar perfil." });
    }
});

router.post('/senha/alterar', autenticarToken, async (req, res) => {
    const userId = req.user.id; 
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }
    
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "A nova senha e a confirmação não coincidem." });
    }
    
    try {
        const user = await prisma.User.findUnique({
            where: { id: userId },
            select: { senha: true } 
        });

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.senha);

        if (!isCurrentPasswordCorrect) {
            return res.status(401).json({ message: "Senha atual incorreta." });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await prisma.User.update({
            where: { id: userId },
            data: { senha: newPasswordHash }
        });

        res.json({ message: "Senha alterada com sucesso." });

    } catch (err) {
        console.error("Erro ao alterar senha:", err);
        res.status(500).json({ message: "Erro interno ao alterar a senha." });
    }
});


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
        
        const historyData = await getAdesaoHistory(
            prisma, 
            adesao.id, 
            user.id, 
            adesao.rotina.nome, 
            adesao.rotina.tipoUnidade, 
            adesao.metaPessoalValor
        );

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
        
        const adesao = await prisma.Adesao.findFirst({
            where: { id: idAdesao, usuarioId: user.id },
        });

        if (!adesao) {
            return res.status(404).json({ message: "Adesão não encontrada." });
        }
        
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


router.post('/rotinas/aderir', autenticarToken, async (req, res) => {
    try {
        const { rotinaId, metaPessoalValor } = req.body;

        if (!rotinaId || metaPessoalValor === undefined) {
            return res.status(400).json({ message: "ID da rotina e valor da meta são obrigatórios." });
        }
        o
        const user = await prisma.User.findUnique({ 
            where: { email: req.user.email }, 
            select: { id: true } 
        });

        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

        const metaValue = parseFloat(metaPessoalValor);
        if (isNaN(metaValue) || metaValue <= 0) {
            return res.status(400).json({ message: "O valor da meta deve ser um número positivo." });
        }


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