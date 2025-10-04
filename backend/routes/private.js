import { PrismaClient } from '@prisma/client'; // caminho correto
import express from 'express';
import { autenticarToken } from '../middleware.js';
const prisma = new PrismaClient();

const router = express.Router();

router.get('/perfil', autenticarToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    res.json({ id: user.id, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar perfil." });
  }
});

export default router;
