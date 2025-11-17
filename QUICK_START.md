# 🚀 QUICK START - Como Rodar Tudo em 5 Minutos

## ⚡ Pré-requisitos (Verificar Primeiro)

- [x] Node.js 18+ instalado (`node -v`)
- [x] Python 3.9+ instalado (`python --version`)
- [x] npm atualizado (`npm -v`)
- [x] MySQL conectável (credenciais preenchidas em `machine/.env`)

---

## 📝 Passo 1: Preparar o Machine Learning (1 minuto)

```bash
cd machine

# Instalar dependências Python
pip install -r requirements.txt

# Verificar que .env existe com credenciais MySQL
# Abrir: machine/.env
# Deve ter:
#   AZURE_MYSQL_HOST=13.68.75.61
#   AZURE_MYSQL_USER=claudio
#   AZURE_MYSQL_PASSWORD=FatecFranca123#
```

---

## 📝 Passo 2: Preparar o Backend (1 minuto)

```bash
cd back

# Verificar que dependências já estão instaladas
ls node_modules

# Se faltarem, executar:
npm install

# Verificar que .env existe
# cat .env | grep AZURE_MYSQL
# Deve retornar as credenciais MySQL
```

---

## 📝 Passo 3: Preparar o Frontend (30 segundos)

```bash
cd front

# Se npm packages não estiverem instalados:
npm install

# Verificar .env.local existe
cat .env.local
```

---

## 📝 Passo 4: Preparar o Mobile (30 segundos)

```bash
cd mobile/game-list

# Se npm packages não estiverem instalados:
npm install
```

---

## ▶️ EXECUTAR: 4 Terminais Simultâneos

### Terminal 1️⃣ - Backend Gateway (Express)

```bash
cd back
npm run dev

# Esperado em ~2 segundos:
# ============================================================
# 🚀 Backend Gateway iniciado com sucesso!
# 📍 Ouvindo em: http://localhost:3000
# ⚙️  Ambiente: development
# 🔗 Flask em: http://localhost:4000
# ============================================================
```

### Terminal 2️⃣ - Machine Learning (Flask)

```bash
cd machine
python api_game.py

# Esperado em ~10 segundos:
# 🚀 Iniciando servidor Flask...
# 📍 Host: 0.0.0.0
# 🔌 Porta: 4000
# 📊 Total de jogos carregados: 50000+
# 🎯 Sistema pronto para receber conexões!
```

### Terminal 3️⃣ - Frontend Web (Next.js)

```bash
cd front
npm run dev

# Esperado:
# ▲ Next.js 15.5.4
# 📍 Local: http://localhost:3001
# Ready in 2.5s
```

### Terminal 4️⃣ - Mobile (Expo)

```bash
cd mobile/game-list
npm start

# Esperado:
# Metro Bundler ready.
# Expo DevTools running at http://localhost:19002
```

---

## 🧪 TESTAR: Verificar que tudo funciona

### Teste 1: Backend está rodando?

```bash
# Em outro terminal (Terminal 5):
curl http://localhost:3000/
```

**Esperado:**

```json
{
  "mensagem": "🎮 API Games Recommendation - Backend Gateway",
  "versao": "2.0",
  "status": "operacional",
  "endpoints": {...}
}
```

### Teste 2: Flask está respondendo?

```bash
curl http://localhost:3000/api/recommendations/system/health
```

**Esperado:**

```json
{
  "sucesso": true,
  "backend": "online",
  "flask": {
    "status": "healthy",
    "jogos_carregados": 50000,
    "modelo_treinado": true
  }
}
```

### Teste 3: Criar um usuário

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@test.com",
    "senha": "123456",
    "confirmarSenha": "123456",
    "categorias": ["Action", "Adventure", "Indie", "Sports"]
  }'
```

**Esperado:**

```json
{
  "mensagem": "Usuário criado com sucesso.",
  "dados": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@test.com",
    "categorias": ["Action", "Adventure", "Indie", "Sports"]
  }
}
```

### Teste 4: Listar categorias

```bash
curl http://localhost:3000/api/users/categories
```

### Teste 5: Buscar jogos

```bash
curl "http://localhost:3000/api/games?page=1&limit=5"
```

### Teste 6: Filtrar por categorias

```bash
curl "http://localhost:3000/api/games/categories?cat1=Action&cat2=Adventure&limit=5"
```

### Teste 7: Avaliar um jogo

```bash
curl -X POST http://localhost:3000/api/games/1/rate \
  -H "Content-Type: application/json" \
  -d '{"positiva": true}'
```

### Teste 8: Obter recomendações

```bash
curl "http://localhost:3000/api/recommendations/users/1?limit=10"
```

---

## ✅ Se Todos os Testes Passarem

Você tem:

- ✅ Backend Express rodando em http://localhost:3000
- ✅ Flask ML rodando em http://localhost:4000
- ✅ MySQL conectado e carregando dados
- ✅ KNN model treinado
- ✅ Frontend pronto em http://localhost:3001
- ✅ Mobile pronto em http://localhost:19002

**Parabéns! Sistema está 100% integrado e funcionando! 🎉**

---

## ⚠️ Erros Comuns & Soluções

### Erro: `ECONNREFUSED 127.0.0.1:4000`

```
❌ Backend não consegue conectar ao Flask
✅ Solução: Verifique se Terminal 2 está rodando
           Aguarde 10 segundos para Flask treinar o modelo
```

### Erro: `Error: listen EADDRINUSE :::3000`

```
❌ Porta 3000 já está em uso
✅ Solução:
   Windows: netstat -ano | findstr :3000
            taskkill /PID <PID> /F
   Linux/Mac: lsof -i :3000 | kill -9 <PID>
```

### Erro: `MySQL Error: connect ECONNREFUSED`

```
❌ Flask não consegue conectar ao MySQL
✅ Solução:
   1. Verificar credenciais em machine/.env
   2. Testar: mysql -h 13.68.75.61 -u claudio -p
   3. Aguarde conexão (pode levar 15 seg na primeira vez)
```

### Erro: `ModuleNotFoundError: No module named 'flask'`

```
❌ Python packages não instalados
✅ Solução: cd machine && pip install -r requirements.txt
```

### Erro: `npm ERR! node_modules/.bin/nodemon: not found`

```
❌ node_modules não instalados
✅ Solução: cd back && rm -rf node_modules && npm install
```

---

## 📊 Checklist Final

- [ ] Terminal 1 (Backend) - Verde ✅
- [ ] Terminal 2 (Flask) - Verde ✅
- [ ] Terminal 3 (Frontend) - Verde ✅
- [ ] Terminal 4 (Mobile) - Verde ✅
- [ ] Teste 1 (Backend respondendo) - OK
- [ ] Teste 2 (System Health) - OK
- [ ] Teste 3 (Criar usuário) - OK
- [ ] Teste 8 (Recomendações) - OK

Se todos os itens estão marcados → **Sistema pronto para uso! 🚀**

---

## 🛑 Para Parar Todos os Serviços

Em cada terminal, pressione: **CTRL+C**

---

**Última atualização:** 14 de Novembro de 2025
**Tempo total para rodar tudo:** ~30 segundos
**Tempo total para treinar ML:** ~10 segundos adicionais
