// // seed.js
// const { PrismaClient } = require('@prisma/client');
// const XLSX = require('xlsx');
// const bcrypt = require('bcrypt');
// const prisma = new PrismaClient();
// const dotenv = require('dotenv');

// dotenv.config();

// const SALT_ROUNDS = 10;

// async function seed() {
//   try {
//     // Untuk Baca file Excel
//     const workbook = XLSX.readFile('SEED-DUMMY (1).xlsx');
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(worksheet);

//     // Loop melalui data dan menambahkan ke dalam database
//     for (const row of data) {
//       const email = row.Email;
//       const name = row.Nama;
//       const password = name;

//       // Hash password
//       const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

//       await prisma.user.upsert({
//         where: { email },
//         update: {},
//         create: {
//           email,
//           name,
//           password: hashedPassword,
//         },
//       });
//     }

//     console.log('Seeder selesai!');
//   } catch (error) {
//     console.error('Error saat seeding:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// seed();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Hash NIP sebagai password
  const hashedNip = await bcrypt.hash("654321", 10); // NIP dummy

  // Tambahkan data pengguna dummy
  const user1 = await prisma.user.create({
    data: {
      name: "abisena",
      email: "test1@example.com",
      password: hashedNip, // NIP di-hash sebagai password
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "guna",
      email: "test2@example.com",
      password: hashedNip,
    },
  });

  console.log("Data pengguna dummy dibuat: ", user1, user2);

  // Tambahkan data absensi dummy untuk user 1 dan user 2
  const absensi1 = await prisma.absensi.create({
    data: {
      userId: user1.id,
      latitude: -7.250445,
      longitude: 112.768845, // Koordinat (Surabaya)
    },
  });

  const absensi2 = await prisma.absensi.create({
    data: {
      userId: user2.id,
      latitude: -6.2087634,
      longitude: 106.845599, // Koordinat (Jakarta)
    },
  });

  console.log("Data absensi dummy dibuat: ", absensi1, absensi2);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
