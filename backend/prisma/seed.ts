import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding minimal data...');
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@AkarMakmur2026!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const existingAdmin = await prisma.user.findFirst({ where: { role: Role.AGROFUND } });
  
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        username: 'admin',
        password: hashedPassword,
        role: Role.AGROFUND,
      }
    });
    console.log('Admin seeded!');
  } else {
    console.log('Admin already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
