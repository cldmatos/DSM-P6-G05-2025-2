const EntryModel = require('../models/entryModel');

function validatePayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Corpo da requisição inválido.');
    return errors;
  }

  const { nome, idade, valor } = payload;

  if (!nome || typeof nome !== 'string') {
    errors.push('"nome" é obrigatório e deve ser uma string.');
  }

  if (idade === undefined || Number.isNaN(Number(idade))) {
    errors.push('"idade" é obrigatória e deve ser um número.');
  }

  if (valor === undefined || Number.isNaN(Number(valor))) {
    errors.push('"valor" é obrigatório e deve ser um número.');
  }

  return errors;
}

const entryController = {
  getAll(req, res) {
    const allEntries = EntryModel.findAll();
    res.json({ dados: allEntries });
  },

  create(req, res) {
    const errors = validatePayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ erros: errors });
    }

    const { nome, idade, valor } = req.body;
    const novoRegistro = EntryModel.create({
      nome,
      idade: Number(idade),
      valor: Number(valor)
    });

    return res.status(201).json({ mensagem: 'Registro criado com sucesso.', dados: novoRegistro });
  }
};

module.exports = entryController;
