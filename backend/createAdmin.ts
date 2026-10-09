import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './src/lib/prisma';

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
      where: {
        email: 'admin@retain.com',
      },
      update: {
        role: 'ADMIN',
        passwordHash,
      },
      create: {
        name: 'Retain Admin',
        email: 'admin@retain.com',
        passwordHash,
        role: 'ADMIN',
      },
    });

    console.log('Admin created successfully:');
    console.log({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();