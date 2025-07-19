require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

// Usuário fixo
const FIXED_USER = {
  email: 'admin',
  username: 'admin',
  password: 'admin12345',
  role: 'Admin'
};

// Endpoint padrão OAuth2 para o Grafana (Token URL)
app.post('/token', (req, res) => {
  const { username, password } = req.body;

  if (
    username === FIXED_USER.username &&
    password === FIXED_USER.password
  ) {
    const token = jwt.sign(
      {
        email: FIXED_USER.email,
        login: FIXED_USER.username,
        role: FIXED_USER.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

// Endpoint de dados do usuário (API URL)
app.get('/userinfo', (req, res) => {
  const authHeader = req.headers.authorization;

  console.log('/userinfo ', '\n')
  console.log('recebido: ', authHeader, '\n')

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    return res.json({
      email: decoded.email,
      login: decoded.login,
      role: decoded.role || 'Viewer'
    });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
});

// Para testes: gerar token diretamente (opcional)
app.get('/get-admin-token', (req, res) => {

  console.log('/get-admin-token ', '\n')
  const token = jwt.sign(
    {
      email: FIXED_USER.email,
      login: FIXED_USER.username,
      role: FIXED_USER.role
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log('token gerado: ', token, '\n')

  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: 3600
  });
});


app.listen(PORT, () => {
  console.log(`OAuth Server running on http://localhost:${PORT}`);
});
