# --- ESTÁGIO 1: Build do Frontend ---
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend

# Copia dependências do front
COPY frontend/package*.json ./
RUN npm install

# Copia código fonte e builda
COPY frontend/ .
# Importante: O Vite precisa saber que a build é para produção
RUN npm run build

# --- ESTÁGIO 2: Setup do Backend + Servidor Final ---
FROM node:22-alpine
WORKDIR /app

# Copia dependências do back
COPY backend/package*.json ./
RUN npm install

# Gera o Prisma Client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copia o código do backend
COPY backend/ .

# --- A MÁGICA ACONTECE AQUI ---
# Copia os arquivos estáticos gerados no Estágio 1 para a pasta 'public' do backend
COPY --from=frontend-build /app/frontend/dist ./public

# Expõe a porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]