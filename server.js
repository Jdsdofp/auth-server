require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 Endpoint para gerar token manualmente
app.post('/generate-token', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const token = jwt.sign({ email, login: password, role }, JWT_SECRET);

  res.json({ token });
});



// Usuário fixo
const FIXED_USER = {
  email: 'admin@grafana.local',
  username: 'admin',
  password: 'admin12345',
  role: 'Admin'
};

// Endpoint padrão para gerar token fixo do admin
app.get('/get-admin-token', (req, res) => {
  const token = jwt.sign(
    {
      email: FIXED_USER.email,
      login: FIXED_USER.username,
      role: FIXED_USER.role
    },
    JWT_SECRET
  );

  res.json({ token });
});



// 🔍 Endpoint que o Grafana vai chamar
app.get('/userinfo', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Estrutura esperada pelo Grafana
    res.json({
      email: decoded.email,
      login: decoded.login,
      role: decoded.role || 'Viewer',
    });
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`OAuth Server running on http://localhost:${PORT}`);
});
