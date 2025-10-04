import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import privateRoutes from './routes/private.js';
import publicRoutes from './routes/public.js';
import esqueciSenhaRoute from './routes/senha.js';

dotenv.config();

const app = express();
app.use(express.json());

// 🔧 Necessário para resolver __dirname em ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📂 Servir os arquivos HTML/CSS/JS da pasta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas públicas
app.use('/api/public', publicRoutes);
app.use('/api/public', esqueciSenhaRoute);

// Rotas privadas
app.use('/api/private', privateRoutes);

app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
  console.log('📂 Acesse http://localhost:3000/html.html');
});
