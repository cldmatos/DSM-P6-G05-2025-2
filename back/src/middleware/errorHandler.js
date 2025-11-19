/**
 * Error Handler Middleware
 * Padroniza respostas de erro em toda a API
 */

const errorHandler = (err, req, res, next) => {
  console.error("❌ Erro:", err);

  // Erros conhecidos
  const message = err?.message || "";

  if (err.response) {
    // Flask ou outro serviço retornou erro
    return res.status(err.response.status || 500).json({
      erro: "Erro ao comunicar com serviço externo",
      detalhes: err.response.data,
    });
  }

  if (message.includes("ECONNREFUSED")) {
    return res.status(503).json({
      erro: "Serviço indisponível",
      detalhes: "Flask não está respondendo",
    });
  }

  if (err.code === "ECONNABORTED" || message.includes("timeout")) {
    return res.status(504).json({
      erro: "Tempo excedido ao comunicar com o serviço de recomendações",
      detalhes: "Flask demorou para responder, tente novamente em instantes",
    });
  }

  // Erro genérico
  res.status(err.status || 500).json({
    erro: message || "Erro interno do servidor",
  });
};

module.exports = errorHandler;
