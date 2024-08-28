// seed.js
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const dotenv = require('dotenv');

dotenv.config();

const SALT_ROUNDS = 10;

async function seed() {
  try {
    // Untuk Baca file Excel
    const workbook = XLSX.readFile('SEED-DUMMY (1).xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Loop melalui data dan menambahkan ke dalam database
    for (const row of data) {
      const email = row.Email;
      const name = row.Nama;
      const password = name;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name,
          password: hashedPassword,
        },
      });
    }

    console.log('Seeder selesai!');
  } catch (error) {
    console.error('Error saat seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
