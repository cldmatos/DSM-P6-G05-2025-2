const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

function ensureDataStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, "[]", "utf8");
    }
  } catch (error) {
    console.warn(
      "Aviso: não foi possível preparar o datastore de usuários:",
      error.message
    );
  }
}

function loadUsersFromDisk() {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    console.warn(
      "Aviso: não foi possível carregar usuários do disco:",
      error.message
    );
  }
  return [];
}

function persistUsers(users) {
  ensureDataStore();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (error) {
    console.warn("Aviso: não foi possível salvar usuários:", error.message);
  }
}

let users = loadUsersFromDisk();

class UserModel {
  static findAll() {
    return users;
  }

  static findById(id) {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) return undefined;
    return users.find((u) => u.id === numericId);
  }

  static findByNome(nome) {
    return users.find((u) => u.nome === nome);
  }

  static findByEmail(email) {
    return users.find((u) => u.email === email);
  }

  static create({ nome, email, categorias, passwordHash, salt }) {
    const now = new Date().toISOString();
    const newUser = {
      id: users.length + 1,
      nome,
      email,
      categorias,
      passwordHash,
      salt,
      criadoEm: now,
      avaliacoes: [],
    };

    users.push(newUser);
    persistUsers(users);
    return newUser;
  }

  static addReview(userId, reviewData) {
    const user = this.findById(userId);
    if (!user) return null;

    if (!Array.isArray(user.avaliacoes)) {
      user.avaliacoes = [];
    }

    const jogoId = Number(reviewData?.jogoId);
    if (!Number.isFinite(jogoId)) {
      throw new Error('"jogoId" inválido.');
    }

    const titulo = reviewData?.titulo ? String(reviewData.titulo) : "";
    const imagem = reviewData?.imagem ? String(reviewData.imagem) : null;

    let nota = Number(reviewData?.nota);
    if (!Number.isFinite(nota)) {
      nota = reviewData?.positivo === true ? 100 : 0;
    }
    const notaNormalizada = Math.max(0, Math.min(100, Math.round(nota)));

    const avaliadoEm = reviewData?.avaliadoEm
      ? new Date(reviewData.avaliadoEm).toISOString()
      : new Date().toISOString();

    const novaAvaliacao = {
      jogoId,
      titulo,
      imagem,
      nota: notaNormalizada,
      avaliadoEm,
    };

    const existingIndex = user.avaliacoes.findIndex(
      (avaliacao) => avaliacao.jogoId === jogoId
    );

    if (existingIndex >= 0) {
      user.avaliacoes[existingIndex] = novaAvaliacao;
    } else {
      user.avaliacoes.push(novaAvaliacao);
    }

    persistUsers(users);
    return novaAvaliacao;
  }

  static toPublicProfile(user) {
    if (!user) return null;

    const avaliacoes = Array.isArray(user.avaliacoes) ? user.avaliacoes : [];
    const totalAvaliacoes = avaliacoes.length;
    const notaMedia =
      totalAvaliacoes > 0
        ? avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.nota, 0) /
          totalAvaliacoes
        : null;

    const avaliacoesOrdenadas = avaliacoes
      .map((avaliacao) => ({ ...avaliacao }))
      .sort(
        (a, b) =>
          new Date(b.avaliadoEm).getTime() - new Date(a.avaliadoEm).getTime()
      );

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      categorias: user.categorias,
      criadoEm: user.criadoEm,
      avaliacoes: avaliacoesOrdenadas,
      estatisticas: {
        totalAvaliacoes,
        notaMedia,
      },
    };
  }
}

module.exports = UserModel;
