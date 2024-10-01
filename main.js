const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const JWT_SECRET = "Absen-guru";

app.post("/login", async (req, res) => {
  const { email, nip } = req.body;

  try {
    if (!email || !nip) {
      return res.status(400).json({ error: "Email dan NIP harus disertakan" });
    }

    if (nip.length !== 13) {
      return res.status(400).json({ error: "NIP harus terdiri dari 14 digit" });
    }
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const nipMatch = await bcrypt.compare(nip, user.password); 
      if (!nipMatch) {
        return res.status(401).json({ error: "NIP tidak sesuai" });
      }
    } else {
      const hashedNip = await bcrypt.hash(nip, 10);
      user = await prisma.user.create({
        data: {
          email,
          password: hashedNip,
        },
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const message = "Berhasil Login";

    res.json({ token, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Terjadi kesalahan pada server saat memproses permintaan",
    });
  }
});


app.post('/absensi', async (req, res) => {
  const { userId, latitude, longitude } = req.body;
  try {
      const absensi = await prisma.absensi.create({
        data: {
          userId,
          latitude,
          longitude,
        },
      });
      res.status(201).json(absensi);
      console.log(absensi);
    } catch (error) {
      res.status(500).json({ error: 'Gagal menyimpan absensi' });
      console.log(error)
    }
  });

app.get("/absensi", async (req, res) => {
  try {
    const absensis = await prisma.absensi.findMany();
    res.status(200).json(absensis);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil absensi" });
  }
});

// Jalankan server di port 3000
app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});
