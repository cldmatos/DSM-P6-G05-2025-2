const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const UserModel = require("../models/userModel");

// Carrega a base CSV e extrai todas as categorias únicas (campo 'categories')
const csvPath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "machine",
  "baseGames_limpa_sem_appid.csv"
);
let validCategories = new Set();
function parseCsvLine(line) {
  const res = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // check for escaped quote
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      res.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  res.push(cur);
  return res;
}

try {
  const csv = fs.readFileSync(csvPath, "utf8");
  const lines = csv.split(/\r?\n/);
  // header -> find index of 'categories'
  if (lines.length > 0) {
    const headerCols = parseCsvLine(lines[0]).map((h) =>
      h.trim().toLowerCase()
    );
    const categoriesIndex = headerCols.indexOf("categories");
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const cols = parseCsvLine(line);
      const raw =
        categoriesIndex >= 0 && categoriesIndex < cols.length
          ? cols[categoriesIndex]
          : "";
      if (!raw) continue;
      if (raw.toLowerCase() === "nan") continue;
      // raw may contain multiple categories separated by commas
      const parts = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const p of parts) validCategories.add(p);
    }
  }
} catch (err) {
  console.warn(
    "Aviso: não foi possível carregar CSV de categorias:",
    err.message
  );
}

function validatePayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    errors.push("Corpo da requisição inválido.");
    return errors;
  }
  const { nome, email, senha, confirmarSenha, categorias } = payload;

  if (!nome || typeof nome !== "string") {
    errors.push('"nome" é obrigatório e deve ser uma string.');
  }

  if (!email || typeof email !== "string") {
    errors.push('"email" é obrigatório e deve ser uma string.');
  } else {
    // simples validação de formato
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) errors.push('"email" em formato inválido.');
  }

  if (!senha || typeof senha !== "string" || senha.length < 6) {
    errors.push(
      '"senha" é obrigatória, deve ser uma string e ter pelo menos 6 caracteres.'
    );
  }

  if (!confirmarSenha || typeof confirmarSenha !== "string") {
    errors.push('"confirmarSenha" é obrigatório.');
  } else if (senha !== confirmarSenha) {
    errors.push('"senha" e "confirmarSenha" não conferem.');
  }

  if (!Array.isArray(categorias) || categorias.length === 0) {
    errors.push(
      '"categorias" é obrigatório e deve ser um array com pelo menos uma categoria.'
    );
  } else {
    const invalid = categorias.some((c) => typeof c !== "string");
    if (invalid) errors.push('Cada item de "categorias" deve ser uma string.');
    if (validCategories.size > 0) {
      const unknown = categorias.filter((c) => !validCategories.has(c));
      if (unknown.length > 0)
        errors.push("Categorias inválidas: " + unknown.join(", "));
    }
  }

  return errors;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return hash === expectedHash;
}

const userController = {
  getAll(req, res) {
    const users = UserModel.findAll().map((u) => ({
      id: u.id,
      nome: u.nome,
      idade: u.idade,
      categorias: u.categorias,
      criadoEm: u.criadoEm,
    }));

    res.json({ dados: users });
  },

  create(req, res) {
    const errors = validatePayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ erros: errors });
    }

    const { nome, email, senha, categorias } = req.body;

    // Verifica existência por email
    const existing = UserModel.findByEmail(email);
    if (existing) {
      return res
        .status(409)
        .json({ mensagem: "Usuário com esse email já existe." });
    }

    const { salt, hash } = hashPassword(senha);

    const created = UserModel.create({
      nome,
      email,
      categorias,
      passwordHash: hash,
      salt,
    });

    // Retorna sem expor passwordHash e salt
    const response = {
      id: created.id,
      nome: created.nome,
      email: created.email,
      categorias: created.categorias,
      criadoEm: created.criadoEm,
    };

    return res
      .status(201)
      .json({ mensagem: "Usuário criado com sucesso.", dados: response });
  },

  login(req, res) {
    const { email, senha } = req.body ?? {};
    if (!email || !senha) {
      return res
        .status(400)
        .json({ mensagem: '"email" e "senha" são obrigatórios.' });
    }

    const user = UserModel.findByEmail(email);
    if (!user || !verifyPassword(senha, user.salt, user.passwordHash)) {
      return res.status(401).json({ mensagem: "Credenciais inválidas." });
    }

    return res.json({
      mensagem: "Login realizado com sucesso.",
      dados: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        categorias: user.categorias,
        criadoEm: user.criadoEm,
      },
    });
  },
};

// Handler para expor categorias válidas ao front
userController.getCategories = function (req, res) {
  const list = Array.from(validCategories).sort();
  res.json({ categorias: list });
};

module.exports = userController;
