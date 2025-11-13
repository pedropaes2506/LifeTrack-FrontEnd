import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "minha_chave_secreta";

// Função utilitária para normalizar o campo 'sexo'
function normalizeSexo(sexo) {
  // Ajuste para aceitar os valores em minúsculo do frontend
  switch (sexo.toLowerCase()) {
    case 'masculino':
      return 'M';
    case 'feminino':
      return 'F';
    case 'outro':
      return 'O';
    default:
      return null;
  }
}

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
        password, // Senha principal
        confirmPassword // Confirmação de senha
    } = req.body;
    
    // 1. Validação de campos obrigatórios
    if (!nome || !email || !password || !cpf || !dataNascimento || !sexo || !confirmPassword) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    // 2. Validação de Confirmação de Senha
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "As senhas não coincidem." });
    }

    // 3. Normalização do campo 'sexo'
    const normalizedSexo = normalizeSexo(sexo);
    const sexoParaDB = normalizedSexo === 'O' ? null : normalizedSexo;
    
    if (sexoParaDB === null && normalizedSexo !== 'O') {
        return res.status(400).json({ message: "O valor fornecido para Sexo é inválido." });
    }

    const hashSenha = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { 
        nome, 
        email, 
        senha: hashSenha, 
        cpf, 
        dataNascimento: new Date(dataNascimento), 
        sexo: sexoParaDB
      },
      // ATUALIZADO: Retorna o nome no cadastro
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
        // ATUALIZADO: Buscar o campo 'nome' na query
        select: { id: true, email: true, nome: true, senha: true } 
    });
    if (!user) {
      return res.status(401).json({ message: "Email inválido." });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: "Senha inválida." });
    }

    // Retorna o token para o frontend
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      id: user.id,
      email: user.email,
      nome: user.nome, // ATUALIZADO: Retorna o nome no login
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no login." });
  }
});

export default router;