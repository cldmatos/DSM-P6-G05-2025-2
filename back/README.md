# Backend Gateway - Games Recommendation API

## 📋 Descrição

Backend Node.js Express que funciona como **Gateway** centralizador entre:
- **Frontend** (Next.js) e **Mobile** (Expo/React Native) 
- **Serviço ML Python** (Flask + KNN Recommender)
- **Banco de Dados** Azure MySQL

## 🏗️ Arquitetura

```
Frontend/Mobile ──┐
                  ├──→ Express Backend (PORT 3000) ──→ Flask (PORT 4000) ──→ MySQL
```

## 🚀 Quick Start

### 1. Instalar dependências
```bash
cd back
npm install
```

### 2. Configurar .env
```bash
# Copiar do .env.example
cp .env.example .env

# Editar .env com suas configurações
# Credenciais MySQL já estão preenchidas com dados do machine/.env
```

### 3. Rodar o servidor
```bash
# Desenvolvimento com nodemon
npm run dev

# Produção
npm start
```

### 4. Verificar saúde
```bash
curl http://localhost:3000/api/recommendations/system/health
```

---

## 📁 Estrutura

```
src/
├── controllers/
│   ├── userController.js          # Autenticação e usuários
│   ├── gameController.js          # Busca de jogos
│   └── recommendationController.js # Recomendações
├── models/
│   └── userModel.js               # Modelo de usuário (in-memory)
├── routes/
│   ├── userRoutes.js
│   ├── gameRoutes.js
│   └── recommendationRoutes.js
├── middleware/
│   ├── flaskProxy.js              # HTTP client para Flask
│   └── errorHandler.js            # Padronização de erros
└── index.js                       # Entrada principal
```

---

## 📡 API Endpoints

### Usuários (`/api/users`)
- `POST /` - Cadastrar
- `POST /login` - Login
- `GET /` - Listar todos
- `GET /categories` - Categorias disponíveis

### Jogos (`/api/games`)
- `GET /` - Listar com paginação
- `GET /:id` - Buscar por ID
- `GET /search?q=termo` - Busca por nome
- `GET /categories?cat1=...&cat2=...&cat3=...&cat4=...` - Filtrar
- `GET /aleatorio` - Aleatório
- `POST /:id/rate` - Avaliar (positiva/negativa)

### Recomendações (`/api/recommendations`)
- `GET /users/:userId` - Personalizado
- `GET /ranking/popular` - Top populares
- `GET /ranking/best` - Top avaliados
- `GET /games/:id/similar` - Similares
- `GET /system/health` - Status

---

## 🔑 Variáveis de Ambiente

```env
# Server
NODE_ENV=development
PORT=3000
JWT_SECRET=seu_secret_com_min_32_chars

# Flask (sua ML Engine)
FLASK_HOST=localhost
FLASK_PORT=4000

# Azure MySQL
AZURE_MYSQL_HOST=13.68.75.61
AZURE_MYSQL_DATABASE=PI6DSM
AZURE_MYSQL_USER=claudio
AZURE_MYSQL_PASSWORD=FatecFranca123#
AZURE_MYSQL_PORT=3306

# URLs do Frontend/Mobile
FRONTEND_URL=http://localhost:3000
MOBILE_URL=exp://localhost:8081
```

---

## 🧪 Testando

### Com cURL
```bash
# Verificar status
curl http://localhost:3000/

# Criar usuário
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"nome":"João","email":"joao@test.com","senha":"123456","confirmarSenha":"123456","categorias":["Action","Adventure","Indie","Sports"]}'

# Listar categorias
curl http://localhost:3000/api/users/categories

# Buscar jogos
curl "http://localhost:3000/api/games?page=1&limit=10"

# Filtrar por categorias
curl "http://localhost:3000/api/games/categories?cat1=Action&cat2=Adventure"

# Avaliar jogo
curl -X POST http://localhost:3000/api/games/1/rate \
  -H "Content-Type: application/json" \
  -d '{"positiva":true}'
```

### Com Postman/Insomnia
1. Importar arquivo `API.postman_collection.json` (criar manualmente ou exportar do Postman)
2. Criar ambiente com variáveis:
   - `BASE_URL`: http://localhost:3000/api
   - `USER_ID`: 1

---

## 🔄 Fluxo de Requisição

```
1. Cliente (Mobile/Web)
   ↓
2. Express App
   ├─ Parse JSON
   ├─ CORS validation
   ├─ Route matching
   ↓
3. Controller
   ├─ Validação
   ├─ Lógica de negócio
   ↓
4. Proxy Flask (se necessário)
   ├─ HTTP request
   ├─ Timeout handling
   ↓
5. Response
   ├─ JSON estruturado
   ├─ Error handling
   ↓
6. Cliente recebe
```

---

## 🐛 Troubleshooting

### Flask não responde
```bash
# Verificar se Flask está rodando
curl http://localhost:4000/

# Checklist:
# 1. Terminal Python aberto?
# 2. pip install -r requirements.txt executado?
# 3. .env do machine configurado?
```

### Porta 3000 em uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### MySQL não conecta
```bash
# Testar conexão
mysql -h 13.68.75.61 -u claudio -p
# Senha: FatecFranca123#

# Verificar no Flask
# Veja os logs da API Flask para detalhes
```

---

## 📚 Dependências

- `express` - Framework web
- `cors` - Cross-origin requests
- `axios` - HTTP client
- `dotenv` - Variáveis de ambiente
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT auth (preparado para expansão)

---

## 📝 Scripts

```bash
npm run dev      # Develop com nodemon
npm start        # Production
npm run server   # Dev + Flask simultaneamente
npm run flask    # Rodar apenas Flask (cd machine && python api_game.py)
```

---

## 🚢 Deploy

### Azure App Service
1. Criar App Service Node.js
2. Adicionar Application Settings:
   - PORT=443
   - NODE_ENV=production
   - Todas as variáveis .env
3. Conectar repositório Git ou fazer zip deploy
4. Configurar startup command: `npm start`

### Docker (Opcional)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src
EXPOSE 3000
CMD ["npm", "start"]
```

---

**Última atualização:** 14 de Novembro de 2025backend to PI 6º Semester

## Como rodar

1. Instale dependências:

```powershell
cd c:\\Users\\Syspro\\Desktop\\Backend
npm install
```

2. Inicie o servidor:

```powershell
npm start
```

3. Endpoints:

- GET /api/entries  -> Lista todos os registros (inicia vazio)
- POST /api/entries -> Cria um registro com JSON { nome, idade, valor }

Exemplo de POST:

```json
{
	"nome": "João",
	"idade": 30,
	"valor": 100.5
}
```

Obs: A aplicação usa armazenamento em memória (sem banco). Reiniciar o servidor limpa os dados.
