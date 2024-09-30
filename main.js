const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios"); // Untuk mengirim request ke API eksternal
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const JWT_SECRET = "Absen-guru"; // Secret untuk JWT

// Endpoint login
app.post("/login", async (req, res) => {
  const { email, nip } = req.body; // Mengambil email dan nip dari request body

  try {
    // Cek apakah email dan nip disertakan
    if (!email || !nip) {
      return res.status(400).json({ error: "Email dan NIP harus disertakan" });
    }

    // Validasi panjang NIP (harus 14 digit)
    if (nip.length !== 13) {
      return res.status(400).json({ error: "NIP harus terdiri dari 14 digit" });
    }

    // Mencari user di database lokal dengan Prisma berdasarkan email
    let user = await prisma.user.findUnique({ where: { email } });

    // Jika user ditemukan, cek apakah NIP cocok (login)
    if (user) {
      const nipMatch = await bcrypt.compare(nip, user.password); // Cocokkan NIP dengan password yang di-hash
      if (!nipMatch) {
        return res.status(401).json({ error: "NIP tidak sesuai" });
      }
    } else {
      // Jika user belum ada di database lokal, simpan data baru
      const hashedNip = await bcrypt.hash(nip, 10); // Hash NIP untuk keamanan

      // Menyimpan user baru ke database
      user = await prisma.user.create({
        data: {
          email,
          password: hashedNip, // Simpan NIP yang di-hash sebagai password
        },
      });
    }

    // Membuat token JWT untuk otentikasi
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const message = "Berhasil Login";

    // Kirim token ke client
    res.json({ token, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Terjadi kesalahan pada server saat memproses permintaan",
    });
  }
});

// Endpoint untuk mengambil semua data absensi
app.get("/absensi", async (req, res) => {
  try {
    const absensis = await prisma.absensi.findMany(); // Mengambil semua data absensi
    res.status(200).json(absensis); // Kirim data absensi ke client
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil absensi" });
  }
});

// Jalankan server di port 3000
app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});
