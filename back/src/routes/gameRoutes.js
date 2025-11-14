/**
 * Game Routes
 * Endpoints para busca e gerenciamento de jogos
 */

const express = require('express');
const gameController = require('../controllers/gameController');

const router = express.Router();

// Rotas de jogos
router.get('/aleatorio', gameController.getRandom);
router.get('/search', gameController.search);
router.get('/categories', gameController.getByCategories);
router.get('/:id/rate', (req, res) => {
  res.status(405).json({ erro: 'Use POST para registrar avaliação' });
});
router.post('/:id/rate', gameController.rate);
router.get('/:id', gameController.getById);
router.get('/', gameController.getAll);

module.exports = router;
