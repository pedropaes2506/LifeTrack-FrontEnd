import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

import privateRoutes from './routes/private.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import esqueciSenhaRoute from './routes/senha.js';
import { autenticarToken } from './middleware.js';

dotenv.config();

const app = express();

// APP_MODE define o papel deste container:
// 'GATEWAY': Container principal (Usuário + Frontend + Proxy para Admin)
// 'ADMIN_SERVICE': Container interno (Apenas API de Admin)
const APP_MODE = process.env.APP_MODE || 'GATEWAY';
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://lifetrack-admin:3000';

console.log(`🚀 Iniciando servidor em modo: ${APP_MODE}`);

// Configurações globais
app.use(cors());

// IMPORTANTE: O Proxy deve vir ANTES do body-parser (express.json) para não corromper requisições POST
if (APP_MODE === 'GATEWAY') {
    // Redireciona qualquer chamada /api/admin para o container de Admin
    app.use('/api/admin', createProxyMiddleware({
        target: ADMIN_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/api/admin': '/api/admin', // Mantém o caminho original
        },
        onProxyReq: (proxyReq, req, res) => {
            // Logs opcionais para debug
            // console.log(`[Proxy] Enviando para Admin: ${req.method} ${req.url}`);
        }
    }));
    console.log(`🔗 Proxy de Admin ativado -> ${ADMIN_SERVICE_URL}`);
}

// Parse de JSON para as rotas locais
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- ROTAS ---

// 1. Rotas Públicas (Sempre ativas em ambos para garantir auth)
app.use('/api/public', publicRoutes);
app.use('/api/public', esqueciSenhaRoute);

// 2. Rotas de Usuário (Ativas apenas no Gateway)
if (APP_MODE === 'GATEWAY') {
    app.use('/api/private', autenticarToken, privateRoutes);
    console.log('✅ Rotas de Usuário Ativadas (Local)');
}

// 3. Rotas de Admin (Ativas apenas no Serviço de Admin)
if (APP_MODE === 'ADMIN_SERVICE') {
    app.use('/api/admin', adminRoutes);
    console.log('🛡️ Rotas de Admin Ativadas (Local)');
}

// --- SERVIR O FRONTEND (Apenas no Gateway) ---
if (APP_MODE === 'GATEWAY') {
    const distPath = path.join(__dirname, 'public');
    app.use(express.static(distPath));

    // Rota "Coringa" para SPA (React) - Compatível com Express 4 e 5
    app.get(/(.*)/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('🎨 Frontend React Ativado');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});