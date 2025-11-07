const entries = [];

class EntryModel {
  static findAll() {
    return entries;
  }

  static create(data) {
    const newEntry = {
      id: entries.length + 1,
      nome: data.nome,
      idade: data.idade,
      valor: data.valor,
      criadoEm: new Date().toISOString(),
    };

    entries.push(newEntry);
    return newEntry;
  }
}

module.exports = EntryModel;
