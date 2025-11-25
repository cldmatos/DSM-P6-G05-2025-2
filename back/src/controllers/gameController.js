/**
 * Game Controller
 * Gerencia requisições relacionadas a jogos
 * Proxy para Flask Recommendation Engine
 */

const { flaskAPI } = require("../middleware/flaskProxy");
const { enrichGameImages } = require("../middleware/imageEnricher");

const gameController = {
  /**
   * GET /api/games - Retorna todos os jogos com paginação
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 50 } = req.query;

      const response = await flaskAPI.get("/jogos", {
        params: {
          pagina: page,
          limite: limit,
        },
      });

      // Enriquecer com imagens
      let dados = response.data;
      if (dados.jogos) {
        dados.jogos = enrichGameImages(dados.jogos);
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
   * GET /api/games/:id - Retorna um jogo específico
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const response = await flaskAPI.get(`/jogos/${id}`);

      // Enriquecer com imagens
      const dados = enrichGameImages(response.data);

      return res.json({
        sucesso: true,
        dados,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/games/search - Busca jogos por nome
   */
  async search(req, res, next) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          erro: 'Parâmetro "q" é obrigatório',
        });
      }

      const response = await flaskAPI.get(
        `/jogos/busca/${encodeURIComponent(q)}`
      );

      // Enriquecer com imagens
      let dados = response.data;
      if (dados.resultados) {
        dados.resultados = enrichGameImages(dados.resultados);
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
   * GET /api/games/categories - Filtra jogos por categorias
   */
  async getByCategories(req, res, next) {
    try {
      const { cat1, cat2, cat3, cat4, limit = 10 } = req.query;

      const response = await flaskAPI.get("/jogos/categorias", {
        params: {
          cat1: cat1 || "",
          cat2: cat2 || "",
          cat3: cat3 || "",
          cat4: cat4 || "",
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
        dados,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/games/aleatorio - Retorna um jogo aleatório
   */
  async getRandom(req, res, next) {
    try {
      const response = await flaskAPI.get("/jogos/aleatorio");

      // Enriquecer com imagens
      const dados = enrichGameImages(response.data);

      return res.json({
        sucesso: true,
        dados,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/games/:id/rate - Registra avaliação de um jogo
   */
  async rate(req, res, next) {
    try {
      const { id } = req.params;
      const { positiva } = req.body;

      if (typeof positiva !== "boolean") {
        return res.status(400).json({
          erro: 'Campo "positiva" é obrigatório e deve ser booleano',
        });
      }

      const gameId = Number.parseInt(id, 10);
      if (!Number.isFinite(gameId)) {
        return res.status(400).json({
          erro: 'Parâmetro "id" inválido para jogo',
        });
      }

      const rawUserId = req.body.userId ?? req.body.user_id;
      const userId = Number.parseInt(rawUserId, 10);

      if (!Number.isFinite(userId)) {
        return res.status(400).json({
          erro: 'Campo "userId" (ou "user_id") é obrigatório e deve ser numérico',
        });
      }

      const endpoint = positiva ? "/avaliacao/positiva" : "/avaliacao/negativa";

      const response = await flaskAPI.post(endpoint, {
        jogo_id: gameId,
        user_id: userId,
      });

      return res.json({
        sucesso: true,
        mensagem: response.data.message || "Avaliação registrada com sucesso",
        dados: response.data,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = gameController;
