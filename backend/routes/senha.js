import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import express from 'express';
import { enviarEmail } from './mail.js';


const prisma = new PrismaClient();
const router = express.Router();

// Rota de recuperação de senha
router.post('/esqueci-senha', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email é obrigatório." });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email não cadastrado." });

    // Gerar senha temporária
    const novaSenha = crypto.randomBytes(4).toString('hex'); // 8 caracteres hexadecimais
    const hashSenha = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha no banco
    await prisma.user.update({
      where: { email },
      data: { senha: hashSenha }
    });

    // Enviar email
    await enviarEmail(
      email,
      "Recuperação de senha",
      `Sua nova senha é: ${novaSenha}\nPor favor, altere após login.`
    );

    res.json({ message: "Nova senha enviada para o email cadastrado." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao processar recuperação de senha." });
  }
});

export default router;
