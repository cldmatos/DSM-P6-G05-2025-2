const express = require('express');
const entryRoutes = require('./routes/entryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/entries', entryRoutes);

app.get('/', (req, res) => {
  res.json({ mensagem: 'API está ativa. Utilize /api/entries.' });
});

app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

// Export the app for testing or external startup
module.exports = app;

// If the file is run directly, start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}
