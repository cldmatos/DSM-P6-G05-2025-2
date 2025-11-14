/**
 * Error Handler Middleware
 * Padroniza respostas de erro em toda a API
 */

const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro:', err);

  // Erros conhecidos
  if (err.response) {
    // Flask ou outro serviço retornou erro
    return res.status(err.response.status || 500).json({
      erro: 'Erro ao comunicar com serviço externo',
      detalhes: err.response.data,
    });
  }

  if (err.message.includes('ECONNREFUSED')) {
    return res.status(503).json({
      erro: 'Serviço indisponível',
      detalhes: 'Flask não está respondendo',
    });
  }

  // Erro genérico
  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor',
  });
};

module.exports = errorHandler;
