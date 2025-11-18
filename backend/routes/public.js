import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

const router = express.Router();
// Use a chave secreta do ambiente ou uma chave padrão (para desenvolvimento)
const JWT_SECRET = process.env.JWT_SECRET || "minha_chave_secreta";

// Rota de teste
router.get('/', (req, res) => {
    res.send('Servidor funcionando 🚀');
});

// Cadastro de usuário
router.post('/cadastro', async (req, res) => {
    try {
        const { 
            nome, 
            email, 
            cpf, 
            dataNascimento, 
            sexo, 
            password, 
            confirmPassword 
        } = req.body;
        
        if (!nome || !email || !password || !cpf || !dataNascimento || !sexo || !confirmPassword) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "As senhas não coincidem." });
        }
        
        const validSexos = ['M', 'F', 'O'];
        if (!validSexos.includes(sexo)) {
            return res.status(400).json({ message: "O valor fornecido para Sexo é inválido. Use M, F ou O." });
        }

        const hashSenha = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { 
                nome, 
                email, 
                senha: hashSenha, 
                cpf, 
                dataNascimento: new Date(dataNascimento), 
                sexo: sexo 
            },
            select: { id: true, email: true, nome: true } 
        });

        res.status(201).json({ id: user.id, email: user.email, nome: user.nome });

    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ message: "Este email ou CPF já está cadastrado." });
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

        const user = await prisma.user.findUnique({ 
            where: { email },
            select: { id: true, email: true, nome: true, senha: true, nivelAcesso: true } 
        });
        if (!user) {
            return res.status(401).json({ message: "Email inválido." });
        }

        const senhaCorreta = await bcrypt.compare(senha, user.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ message: "Senha inválida." });
        }

        // ⬅️ CORREÇÃO CRÍTICA: INJETAR O ID DO USUÁRIO NO PAYLOAD DO JWT
        const token = jwt.sign(
          { 
            id: user.id, // ✅ ID ADICIONADO AQUI
            email: user.email, 
            nivelAcesso: user.nivelAcesso 
          }, 
          JWT_SECRET, 
          { expiresIn: "1h" }
        );

        res.json({
            id: user.id,
            email: user.email,
            nome: user.nome,
            nivelAcesso: user.nivelAcesso,
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro no login." });
    }
});

export default router;