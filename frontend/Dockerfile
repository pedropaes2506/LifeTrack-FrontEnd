# --- FASE 1: BUILD ---
FROM node:22-alpine AS build
WORKDIR /app

# Copia e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o código fonte e compila (gera os arquivos estáticos)
COPY . .
# Use o comando correto para gerar a build de produção (ex: 'npm run build')
RUN npm run build 

# --- FASE 2: PRODUÇÃO (Servidor Web Nginx) ---
FROM nginx:stable-alpine AS production
# Copia os arquivos estáticos compilados para o local que o Nginx serve
COPY --from=build /app/dist /usr/share/nginx/html

# Porta padrão do Nginx (80)
EXPOSE 80 
# Comando para manter o servidor Nginx rodando
CMD ["nginx", "-g", "daemon off;"]