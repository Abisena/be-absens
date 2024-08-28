// index.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const JWT_SECRET = 'Absen-guru';

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
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

app.get('/absensi', async (req, res) => {
  try {
    const absensis = await prisma.absensi.findMany();
    res.status(200).json(absensis);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil absensi' });
  }
});

app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
