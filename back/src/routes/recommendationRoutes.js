/**
 * Recommendation Routes
 * Endpoints para recomendações personalizadas e rankings
 */

const express = require('express');
const recommendationController = require('../controllers/recommendationController');

const router = express.Router();

// Rotas de recomendações
router.get('/system/health', recommendationController.getSystemHealth);
router.get('/ranking/popular', recommendationController.getPopular);
router.get('/ranking/best', recommendationController.getBestRated);
router.get('/users/:userId', recommendationController.getForUser);
router.get('/games/:id/similar', recommendationController.getSimilar);

module.exports = router;
