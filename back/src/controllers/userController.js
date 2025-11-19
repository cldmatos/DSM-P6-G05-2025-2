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

function buildUserProfile(user) {
  return UserModel.toPublicProfile(user);
}

const userController = {
  getAll(req, res) {
    const users = UserModel.findAll().map((u) => {
      const profile = buildUserProfile(u);
      return {
        id: profile.id,
        nome: profile.nome,
        categorias: profile.categorias,
        criadoEm: profile.criadoEm,
        estatisticas: profile.estatisticas,
      };
    });

    res.json({ sucesso: true, dados: users });
  },

  getById(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Identificador de usuário inválido.",
      });
    }

    const user = UserModel.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ sucesso: false, mensagem: "Usuário não encontrado." });
    }

    const profile = buildUserProfile(user);
    return res.json({
      sucesso: true,
      mensagem: "Usuário encontrado com sucesso.",
      dados: profile,
    });
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

    const profile = buildUserProfile(created);

    return res.status(201).json({
      sucesso: true,
      mensagem: "Usuário criado com sucesso.",
      dados: profile,
    });
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

    const profile = buildUserProfile(user);

    return res.json({
      sucesso: true,
      mensagem: "Login realizado com sucesso.",
      dados: profile,
    });
  },
};

// Handler para expor categorias válidas ao front
userController.getCategories = function (req, res) {
  const list = Array.from(validCategories).sort();
  res.json({ sucesso: true, categorias: list });
};

userController.addReview = function (req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res
      .status(400)
      .json({ sucesso: false, mensagem: "Identificador de usuário inválido." });
  }

  const baseUser = UserModel.findById(id);
  if (!baseUser) {
    return res
      .status(404)
      .json({ sucesso: false, mensagem: "Usuário não encontrado." });
  }

  const { jogoId, titulo, imagem, nota, positivo, avaliadoEm } = req.body ?? {};
  const errors = [];

  if (jogoId === undefined) {
    errors.push('"jogoId" é obrigatório.');
  }

  if (!titulo || typeof titulo !== "string") {
    errors.push('"titulo" é obrigatório e deve ser uma string.');
  }

  const notaInformada = nota !== undefined;
  const positivoInformado = typeof positivo === "boolean";

  if (!notaInformada && !positivoInformado) {
    errors.push('Informe "nota" (0-100) ou "positivo" (booleano).');
  }

  if (notaInformada) {
    const numeroNota = Number(nota);
    if (!Number.isFinite(numeroNota)) {
      errors.push('"nota" deve ser um número.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ sucesso: false, erros: errors });
  }

  let novaAvaliacao;
  try {
    const jaExistia = Array.isArray(baseUser.avaliacoes)
      ? baseUser.avaliacoes.some(
          (avaliacao) => avaliacao.jogoId === Number(jogoId)
        )
      : false;

    novaAvaliacao = UserModel.addReview(id, {
      jogoId,
      titulo,
      imagem,
      nota,
      positivo,
      avaliadoEm,
    });

    const updatedProfile = buildUserProfile(UserModel.findById(id));

    return res.status(jaExistia ? 200 : 201).json({
      sucesso: true,
      mensagem: jaExistia
        ? "Avaliação atualizada com sucesso."
        : "Avaliação registrada com sucesso.",
      dados: updatedProfile,
      avaliacao: novaAvaliacao,
    });
  } catch (error) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Não foi possível registrar a avaliação.",
      erro: error instanceof Error ? error.message : String(error),
    });
  }
};

module.exports = userController;
