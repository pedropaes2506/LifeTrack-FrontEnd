# backend/Dockerfile

# Use uma imagem Node oficial para o seu ambiente
FROM node:22-alpine

# Define o diretório de trabalho no container
WORKDIR /backend

# Copia package.json e package-lock.json para instalar dependências
COPY prisma/ ./prisma/
COPY package*.json ./

# Instala todas as dependências
RUN npm install

# Gera o Prisma Client, que agora usará o binário correto para o ambiente Linux/Alpine
RUN npx prisma generate

# Copia o restante do código da aplicação
COPY . .

# Expõe a porta que o servidor Node usa
EXPOSE 3000

# Comando para iniciar a aplicação (substitua o "npm run dev" pelo seu script de start ou comando de execução principal)
CMD ["npm", "start"]