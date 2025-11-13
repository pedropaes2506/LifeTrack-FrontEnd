import cors from 'cors'; // Importar CORS
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import privateRoutes from './routes/private.js';
import publicRoutes from './routes/public.js';
import esqueciSenhaRoute from './routes/senha.js';
import { autenticarToken } from './middleware.js'; // ⬅️ CORREÇÃO: Importar middleware de autenticação

dotenv.config();

const app = express();
app.use(express.json());

// 🔓 HABILITAR CORS para permitir que o frontend React acesse esta API
// Em produção, você deve restringir isso ao domínio do seu frontend.
app.use(cors({
    origin: '*', // Permite qualquer origem durante o desenvolvimento
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 🔧 Necessário para resolver __dirname em ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📂 SERVIDOR DE ARQUIVOS ESTÁTICOS (Comentado: O frontend React fará isso)
// app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas públicas
app.use('/api/public', publicRoutes);
app.use('/api/public', esqueciSenhaRoute);

// Rotas privadas
app.use('/api/private', autenticarToken, privateRoutes); // ⬅️ CORREÇÃO: Aplicar middleware de autenticação

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  // console.log('📂 Acesse http://localhost:3000/html.html'); // Comentado por causa do React
});