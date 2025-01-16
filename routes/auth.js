const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db'); // Certifique-se de que '../db' aponta para o arquivo correto de configuração do banco
const router = express.Router();
const path = require('path');

// Tela de Login
router.get('/login', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../views/login.html'));
});

// Processar Login
router.post('/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).send('Por favor, preencha todos os campos.');
  }

  db.get(
    `SELECT * FROM users WHERE username = ? OR email = ?`,
    [identifier, identifier],
    async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro no servidor.');
      }

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send('Usuário ou senha inválidos.');
      }

      // Configura a sessão do usuário
      req.session.userId = user.id;
      res.redirect('/personagem');
    }
  );
});

// Tela de Cadastro
router.get('/register', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../views/register.html'));
});

// Processar Cadastro
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send('Por favor, preencha todos os campos.');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hashedPassword],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Erro ao registrar o usuário. Verifique se o e-mail ou usuário já existe.');
        }
        res.redirect('/auth/login');
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao processar o cadastro.');
  }
});

// Rota de Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao encerrar a sessão:', err);
      return res.status(500).send('Erro ao encerrar a sessão.');
    }
    res.redirect('/auth/login'); // Redireciona para a página de login
  });
});

module.exports = router;
