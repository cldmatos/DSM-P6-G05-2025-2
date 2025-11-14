// Carregar variáveis de ambiente
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE GLOBAL
// ============================================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.MOBILE_URL || 'exp://localhost:8081',
  ],
  credentials: true,
}));

// ============================================================================
// ROTAS DA API
// ============================================================================

app.get("/", (req, res) => {
  res.json({
    mensagem: "🎮 API Games Recommendation - Backend Gateway",
    versao: "2.0",
    status: "operacional",
    endpoints: {
      usuarios: "/api/users",
      jogos: "/api/games",
      recomendacoes: "/api/recommendations",
      saude: "/api/recommendations/system/health"
    }
  });
});

app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/recommendations", recommendationRoutes);

// ============================================================================
// TRATAMENTO DE ERROS
// ============================================================================

app.use((req, res) => {
  res.status(404).json({ 
    erro: "Rota não encontrada",
    path: req.path,
    metodo: req.method
  });
});

app.use(errorHandler);

// ============================================================================
// STARTUP
// ============================================================================

// Export the app for testing or external startup
module.exports = app;

// If the file is run directly, start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Backend Gateway iniciado com sucesso!`);
    console.log(`📍 Ouvindo em: http://localhost:${PORT}`);
    console.log(`⚙️  Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Flask em: http://${process.env.FLASK_HOST}:${process.env.FLASK_PORT}`);
    console.log(`${'='.repeat(60)}\n`);
  });
}
