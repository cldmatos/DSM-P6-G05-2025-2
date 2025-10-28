const users = [];

class UserModel {
  static findAll() {
    return users;
  }

  static findByNome(nome) {
    return users.find(u => u.nome === nome);
  }

  static findByEmail(email) {
    return users.find(u => u.email === email);
  }

  static create({ nome, email, categorias, passwordHash, salt }) {
    const newUser = {
      id: users.length + 1,
      nome,
      email,
      categorias,
      passwordHash,
      salt,
      criadoEm: new Date().toISOString()
    };

    users.push(newUser);
    return newUser;
  }
}

module.exports = UserModel;
