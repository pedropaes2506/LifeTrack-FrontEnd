import { PrismaClient } from '@prisma/client';
import express from 'express';
import { autenticarToken } from '../middleware.js'; // Assumindo que este caminho é correto

const prisma = new PrismaClient();
const router = express.Router();

// ROTA EXISTENTE: Buscar Perfil do Usuário Logado
router.get('/perfil', autenticarToken, async (req, res) => {
  try {
    // Usamos 'email' do token, mas precisamos buscar os campos 'nome' e 'id' para uso no frontend
    const user = await prisma.user.findUnique({ 
        where: { email: req.user.email },
        select: { id: true, email: true, nome: true } // Garantindo que 'nome' e 'id' sejam retornados
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
        const rotinas = await prisma.rotina.findMany({
            where: { ativa: true }, // Apenas rotinas ativas
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
        // Encontra o ID do usuário (o token deve ter o email, mas o ID é mais seguro)
        const user = await prisma.user.findUnique({ 
            where: { email: req.user.email }, 
            select: { id: true } 
        });

        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

        // Busca todas as adesões do usuário
        const minhasRotinas = await prisma.adesao.findMany({
            where: { 
                usuarioId: user.id,
                statusAdesao: true // Apenas adesões ativas
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
        
        // Formata a resposta para ser mais limpa no frontend
        const rotinasFormatadas = minhasRotinas.map(adesao => ({
            adesaoId: adesao.id,
            nome: adesao.rotina.nome,
            meta: adesao.metaPessoalValor,
            unidade: adesao.rotina.tipoUnidade,
            // Aqui você deve adicionar a lógica de "current" e "streak" posteriormente
            // Por agora, o valor atual será 0 e o streak será simulado.
            current: 0, 
            streak: 0
        }));

        res.json(rotinasFormatadas);

    } catch (err) {
        console.error("Erro ao listar minhas rotinas:", err);
        res.status(500).json({ message: "Erro ao listar as rotinas do usuário." });
    }
});

// NOVA ROTA: Adesão a uma Rotina
router.post('/rotinas/aderir', autenticarToken, async (req, res) => {
    try {
        const { rotinaId, metaPessoalValor } = req.body;

        if (!rotinaId || metaPessoalValor === undefined) {
            return res.status(400).json({ message: "ID da rotina e valor da meta são obrigatórios." });
        }
        
        // 1. Encontrar o ID do usuário logado
        const user = await prisma.user.findUnique({ 
            where: { email: req.user.email }, 
            select: { id: true } 
        });

        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

        // 2. Tentar criar a adesão
        const novaAdesao = await prisma.adesao.create({
            data: {
                usuarioId: user.id,
                rotinaId: rotinaId,
                metaPessoalValor: parseFloat(metaPessoalValor), // Garante que é um float
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