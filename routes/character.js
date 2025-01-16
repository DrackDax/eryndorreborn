const express = require('express');
const path = require('path');
const db = require('../db'); // Conexão com o banco de dados
const router = express.Router();

// Rota: Exibir lista de personagens
router.get('/', (req, res) => {
    if (!req.session.userId) {
      return res.redirect('/auth/login'); // Redireciona para login se não estiver logado
    }
  
    // Busca o nome do usuário
    db.get(
      `SELECT username FROM users WHERE id = ?`,
      [req.session.userId],
      (err, user) => {
        if (err || !user) {
          console.error(err);
          return res.status(500).send('Erro ao carregar dados do usuário.');
        }
  
        // Busca os personagens do usuário
        db.all(
          `SELECT name, race, class, level FROM characters WHERE user_id = ?`,
          [req.session.userId],
          (err, characters) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Erro ao carregar personagens.');
            }
  
            // Renderiza a view com os dados
            res.render('personagens', { username: user.username, characters });
          }
        );
      }
    );
  });
  
  

// Rota: Exibir formulário para criar personagem
router.get('/create', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login'); // Redireciona para login se não estiver logado
  }

  // Renderiza o formulário de criação
  res.sendFile(path.join(__dirname, '../views/criar-personagem.html'));
});

// Rota: Processar criação de personagem
router.post('/create', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login'); // Redireciona para login se não estiver logado
  }

  const { name, race, class: charClass } = req.body;

  if (!name || !race || !charClass) {
    return res.status(400).send('Preencha todos os campos.');
  }

  // Insere o novo personagem no banco de dados
  db.run(
    `INSERT INTO characters (user_id, name, race, class) VALUES (?, ?, ?, ?)`,
    [req.session.userId, name, race, charClass],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro ao criar o personagem.');
      }
      res.redirect('/personagem'); // Redireciona para a lista de personagens
    }
  );
});

router.post('/delete', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login'); // Redireciona para login se não logado
  }

  const { name } = req.body;

  // Exclui o personagem pelo nome e ID do usuário logado
  db.run(
    `DELETE FROM characters WHERE user_id = ? AND name = ?`,
    [req.session.userId, name],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro ao excluir o personagem.');
      }
      res.redirect('/personagem'); // Redireciona para a lista de personagens
    }
  );
});

// Rota: Página Central do Jogo
router.get('/jogo', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login'); // Redireciona para login se o usuário não estiver logado
  }

  const { name } = req.query; // Obtém o nome do personagem a partir da URL

  // Busca os dados do personagem pelo nome e ID do usuário
  db.get(
    `SELECT name, race, class, level FROM characters WHERE user_id = ? AND name = ?`,
    [req.session.userId, name],
    (err, character) => {
      if (err || !character) {
        console.error(err);
        return res.status(404).send('Personagem não encontrado.');
      }

      // Renderiza a página central do jogo
      res.render('central', { character });
    }
  );
});

module.exports = router;