const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Documentação Backend PDF</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: #f0f0f0;
        }
        .container {
          text-align: center;
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 { color: #0788D9; }
        a {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 30px;
          background: #05DBF2;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          transition: background 0.3s;
        }
        a:hover {
          background: #0788D9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📚 Documentação Backend</h1>
        <p>Versão 2.0 - Sistema de Recomendação de Games</p>
        <a href="/DOCUMENTACAO_BACKEND.pdf" download>📥 Download PDF</a>
        <br>
        <a href="/DOCUMENTACAO_BACKEND.html" target="_blank">🌐 Ver HTML</a>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`\n✅ Servidor de documentação rodando!`);
  console.log(`📄 Acesse: http://localhost:${PORT}`);
  console.log(`📥 Download PDF: http://localhost:${PORT}/DOCUMENTACAO_BACKEND.pdf\n`);
});
