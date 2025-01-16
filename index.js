const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const path = require('path');
const characterRoutes = require('./routes/character');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para processar dados do corpo da requisição
app.use(express.urlencoded({ extended: false })); // Para dados de formulários (POST)
app.use(express.json()); // Para dados JSON (se necessário)

// Middleware para sessões
app.use(session({
  secret: 'seu-segredo-aqui', // Altere para uma string segura
  resave: false,
  saveUninitialized: true,
}));

// Middleware para servir arquivos estáticos (imagens, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para logar todas as requisições (opcional, útil para depuração)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rotas
app.use('/auth', authRoutes);

// Página inicial (redireciona para login)
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// Configurar o EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rotas de Personagem
app.use('/personagem', characterRoutes);

app.use('/', characterRoutes);


// Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
