const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const HOST = '0.0.0.0';
const PORT = process.env.PORT || 80;
const DATA_FILE = path.join(__dirname, 'products.json');
const LIKES_FILE = path.join(__dirname, 'likes.json');

app.use(cors());
app.use(express.json());

// Helpers para produtos
function readProducts() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return data ? JSON.parse(data) : [];
}
function saveProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

// Helpers para likes/dislikes
function readLikes() {
  if (!fs.existsSync(LIKES_FILE)) return {};
  const data = fs.readFileSync(LIKES_FILE, 'utf-8');
  return data ? JSON.parse(data) : {};
}
function saveLikes(likes) {
  fs.writeFileSync(LIKES_FILE, JSON.stringify(likes, null, 2));
}

// GET - lista todos os produtos
app.get('/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

// POST - adiciona um novo produto
app.post('/products', (req, res) => {
  const products = readProducts();
  const newProduct = { ...req.body, id: products.length + 1 };
  products.push(newProduct);
  saveProducts(products);
  res.status(201).json(newProduct);
});

// GET - retorna likes/dislikes de todos os produtos (apenas contagem)
app.get('/likes', (req, res) => {
  const likes = readLikes();
  const result = {};
  for (const [productId, data] of Object.entries(likes)) {
    result[productId] = {
      like: Object.values(data.users).filter(v => v === 'like').length,
      dislike: Object.values(data.users).filter(v => v === 'dislike').length
    };
  }
  res.json(result);
});

// POST - registra um like
app.post('/like', (req, res) => {
  const { productId, userId } = req.body;
  if (!productId || !userId) return res.status(400).json({ error: 'productId e userId são obrigatórios' });
  const likes = readLikes();
  if (!likes[productId]) likes[productId] = { users: {} };
  likes[productId].users[userId] = 'like';
  saveLikes(likes);

  // Conta likes/dislikes
  const likeCount = Object.values(likes[productId].users).filter(v => v === 'like').length;
  const dislikeCount = Object.values(likes[productId].users).filter(v => v === 'dislike').length;
  res.json({ success: true, likes: { like: likeCount, dislike: dislikeCount } });
});

// POST - registra um dislike
app.post('/dislike', (req, res) => {
  const { productId, userId } = req.body;
  if (!productId || !userId) return res.status(400).json({ error: 'productId e userId são obrigatórios' });
  const likes = readLikes();
  if (!likes[productId]) likes[productId] = { users: {} };
  likes[productId].users[userId] = 'dislike';
  saveLikes(likes);

  // Conta likes/dislikes
  const likeCount = Object.values(likes[productId].users).filter(v => v === 'like').length;
  const dislikeCount = Object.values(likes[productId].users).filter(v => v === 'dislike').length;
  res.json({ success: true, likes: { like: likeCount, dislike: dislikeCount } });
});

app.use(express.static(path.join(__dirname, '..', '..', 'dist')));

// Para qualquer rota não-API, devolva o index.html do build
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});