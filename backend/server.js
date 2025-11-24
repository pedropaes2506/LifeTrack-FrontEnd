import cors from 'cors'; // Importar CORS
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import privateRoutes from './routes/private.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import esqueciSenhaRoute from './routes/senha.js';
import { autenticarToken, autorizarNivelAcesso } from './middleware.js';

dotenv.config();

const app = express();
app.use(express.json());

// 🔓 HABILITAR CORS para permitir que o frontend React acesse esta API
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 🔧 Necessário para resolver __dirname em ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rotas públicas (Cadastro, Login, etc.)
app.use('/api/public', publicRoutes);
app.use('/api/public', esqueciSenhaRoute);

// Rotas privadas (Requer apenas estar logado)
app.use('/api/private', autenticarToken, privateRoutes); 

// Rotas administrativas (Requer autenticação e nível de acesso checado dentro de admin.js)
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});