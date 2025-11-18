import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const ADMIN_EMAIL = 'admin@lifetrack.com';
const ADMIN_PASSWORD = 'admin123'; // Mude esta senha!

async function main() {
  console.log('Iniciando script de seeding para criação do usuário Admin...');

  // Criptografa a senha do administrador
  const hashSenha = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Usa upsert: tenta atualizar (se existir) ou criar (se não existir)
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      // Garante que o nível de acesso é ADMIN, caso o usuário já exista
      nivelAcesso: 'ADMIN',
    },
    create: {
      nome: 'Admin Mestre',
      email: ADMIN_EMAIL,
      senha: hashSenha,
      cpf: '99999999999',
      sexo: 'O', // Outros
      nivelAcesso: 'ADMIN',
      dataNascimento: new Date('1980-01-01'),
      // Data de criação e modificação serão automáticas (@default(now()))
    },
  });

  console.log(`Usuário Admin (${adminUser.email}) criado/atualizado com sucesso.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });