const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o banco de dados SQLite
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Cria ou conecta ao banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Script SQL para criar as tabelas
const createTables = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    race TEXT NOT NULL,
    class TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
`;

// Executa o script SQL
db.exec(createTables, (err) => {
  if (err) {
    console.error('Erro ao criar tabelas:', err.message);
  } else {
    console.log('Tabelas criadas com sucesso.');
  }
});

module.exports = db;
