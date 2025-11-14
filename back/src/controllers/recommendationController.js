/**
 * Recommendation Controller
 * Gerencia requisições de recomendações personalizadas
 */

const { flaskAPI } = require('../middleware/flaskProxy');
const { enrichGameImages } = require('../middleware/imageEnricher');
const UserModel = require('../models/userModel');

const recommendationController = {
  /**
   * GET /api/users/:userId/recommendations - Recomendações personalizadas por categorias
   */
  async getForUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { limit = 10 } = req.query;

      // Buscar usuário e suas categorias
      const users = UserModel.findAll();
      const user = users.find((u) => u.id === parseInt(userId));

      if (!user) {
        return res.status(404).json({
          erro: 'Usuário não encontrado',
        });
      }

      if (!user.categorias || user.categorias.length === 0) {
        return res.status(400).json({
          erro: 'Usuário não possui categorias definidas',
        });
      }

      // Pegar até 4 categorias do usuário
      const categorias = user.categorias.slice(0, 4);

      // Chamar Flask para obter recomendações
      const response = await flaskAPI.get('/jogos/categorias', {
        params: {
          cat1: categorias[0] || '',
          cat2: categorias[1] || '',
          cat3: categorias[2] || '',
          cat4: categorias[3] || '',
          limite: limit,
        },
      });

      // Enriquecer com imagens
      let dados = response.data;
      if (dados.jogos) {
        dados.jogos = enrichGameImages(dados.jogos);
      } else if (Array.isArray(dados)) {
        dados = enrichGameImages(dados);
      }

      return res.json({
        sucesso: true,
        usuarioId: userId,
        categoriasUsadas: categorias,
        dados,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ranking/popular - Jogos mais populares
   */
  async getPopular(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const response = await flaskAPI.get('/ranking/populares', {
        params: { limite: limit },
      });

      // Enriquecer com imagens
      let dados = response.data;
      if (dados.jogos) {
        dados.jogos = enrichGameImages(dados.jogos);
      } else if (Array.isArray(dados)) {
        dados = enrichGameImages(dados);
      }

      return res.json({
        sucesso: true,
        dados,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ranking/best - Jogos melhor avaliados
   */
  async getBestRated(req, res, next) {
    try {
      const { limit = 10, minRatings = 5 } = req.query;

      const response = await flaskAPI.get('/ranking/melhores', {
        params: {
          limite: limit,
          min_avaliacoes: minRatings,
        },
      });

      // Enriquecer com imagens
      let dados = response.data;
      if (dados.jogos) {
        dados.jogos = enrichGameImages(dados.jogos);
      } else if (Array.isArray(dados)) {
        dados = enrichGameImages(dados);
      }

      return res.json({
        sucesso: true,
        dados,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/games/:id/recommendations - Recomendações baseadas em similaridade
   */
  async getSimilar(req, res, next) {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;

      const response = await flaskAPI.get(`/jogos/${id}/recomendacoes`, {
        params: { limite: limit },
      });

      // Enriquecer com imagens
      let dados = response.data;
      if (dados.jogos) {
        dados.jogos = enrichGameImages(dados.jogos);
      } else if (Array.isArray(dados)) {
        dados = enrichGameImages(dados);
      }

      return res.json({
        sucesso: true,
        jogoBaseId: id,
        dados,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/system/health - Status do sistema
   */
  async getSystemHealth(req, res, next) {
    try {
      const response = await flaskAPI.get('/health');

      return res.json({
        sucesso: true,
        backend: 'online',
        flask: response.data,
      });
    } catch (error) {
      return res.json({
        sucesso: false,
        backend: 'online',
        flask: 'offline',
        erro: error.message,
      });
    }
  },
};

module.exports = recommendationController;
