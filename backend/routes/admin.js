import { PrismaClient } from '@prisma/client';
import express from 'express';
import { autenticarToken, autorizarNivelAcesso } from '../middleware.js'; 

const prisma = new PrismaClient();
const router = express.Router();

function isValidTipoUnidade(tipo) {
    const validTypes = ['ML', 'HORAS', 'MINUTOS', 'UNIDADE', 'PASSOS'];
    return validTypes.includes(tipo);
}
const adminRotinasMiddleware = [autenticarToken, autorizarNivelAcesso(['ADMIN', 'MODERATOR'])];

router.post('/rotinas', adminRotinasMiddleware, async (req, res) => {
    const { nome, metaValorPadrao, tipoUnidade, ativa } = req.body;

    if (!nome || !tipoUnidade) {
        return res.status(400).json({ message: "Nome e tipoUnidade são obrigatórios." });
    }
    if (!isValidTipoUnidade(tipoUnidade)) {
        return res.status(400).json({ message: "Tipo de unidade inválido. Use: ML, HORAS, MINUTOS, UNIDADE ou PASSOS." });
    }

    try {
        const novaRotina = await prisma.rotina.create({
            data: {
                nome: nome,
                metaValorPadrao: metaValorPadrao || null,
                tipoUnidade: tipoUnidade,
                ativa: ativa !== undefined ? ativa : true,
            }
        });
        res.status(201).json(novaRotina);
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ message: "Rotina com este nome já existe." });
        }
        console.error(err);
        res.status(500).json({ message: "Erro ao criar nova rotina." });
    }
});

router.get('/rotinas', adminRotinasMiddleware, async (req, res) => {
    try {
        const rotinas = await prisma.rotina.findMany();
        res.json(rotinas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao listar todas as rotinas." });
    }
});


router.put('/rotinas/:id', adminRotinasMiddleware, async (req, res) => {
    const { id } = req.params;
    const { nome, metaValorPadrao, tipoUnidade, ativa } = req.body;

    if (tipoUnidade && !isValidTipoUnidade(tipoUnidade)) {
        return res.status(400).json({ message: "Tipo de unidade inválido. Use: ML, HORAS, MINUTOS, UNIDADE ou PASSOS." });
    }

    try {
        const rotinaAtualizada = await prisma.rotina.update({
            where: { id: parseInt(id) },
            data: {
                nome,
                metaValorPadrao,
                tipoUnidade,
                ativa,
            }
        });
        res.json(rotinaAtualizada);
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: "Rotina não encontrada." });
        }
        if (err.code === 'P2002') {
            return res.status(409).json({ message: "Rotina com este nome já existe." });
        }
        console.error(err);
        res.status(500).json({ message: "Erro ao atualizar rotina." });
    }
});


router.delete('/rotinas/:id', adminRotinasMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.rotina.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send(); // 204 No Content
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ message: "Rotina não encontrada." });
        }
        // P2003: Foreign Key Constraint (Se houver adesões ligadas, o delete falha)
        if (err.code === 'P2003') { 
             return res.status(409).json({ message: "Não é possível deletar esta rotina, pois existem usuários aderidos a ela." });
        }
        console.error(err);
        res.status(500).json({ message: "Erro ao deletar rotina." });
    }
});


export default router;