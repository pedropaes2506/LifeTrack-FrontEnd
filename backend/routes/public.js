import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "minha_chave_secreta";

// Rota de teste
router.get('/', (req, res) => {
  res.send('Servidor funcionando 🚀');
});

// Cadastro de usuário
router.post('/cadastro', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    const hashSenha = await bcrypt.hash(senha, 10);

    const user = await prisma.user.create({
      data: { email, senha: hashSenha },
      select: { id: true, email: true }
    });

    res.status(201).json(user);

  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: "Este email já está cadastrado." });
    }
    console.error(err);
    res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email inválido." });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: "Senha inválida." });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      id: user.id,
      email: user.email,
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no login." });
  }
});

export default router;
