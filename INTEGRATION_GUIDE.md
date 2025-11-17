# 🎮 Games Recommendation System - Guia de Integração Completa

## 📋 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND & MOBILE                          │
│  Next.js 15 (Web)  │  Expo/React Native (iOS/Android)      │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ HTTP Requests
                      ↓
┌─────────────────────────────────────────────────────────────┐
│          NODE.JS EXPRESS - BACKEND GATEWAY (PORT 3000)      │
│  • Autenticação e JWT                                       │
│  • Proxy inteligente para Flask                             │
│  • Gerenciamento de usuários                                │
└─────────────────────────────────────────────────────────────┘
         │                                    │
    (User Data)                       (Game Recommendations)
         │                                    │
         ↓                                    ↓
    ┌─────────────────────────────────────────────────┐
    │  PYTHON FLASK - ML ENGINE (PORT 4000)          │
    │  • KNN Recommender                              │
    │  • Game Filtering por Categorias                │
    │  • Rankings (Popular/BestRated)                 │
    └──────────────┬──────────────────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │  AZURE MYSQL         │
        │  PI6DSM Database     │
        │  - Tabela: games     │
        └──────────────────────┘
```

---

## 🚀 Pré-requisitos

### Sistema

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.9+** - [Download](https://www.python.org/)
- **Git**
- **Conexão com Azure MySQL** (já configurada)

### Dependências instaladas

- ✅ Backend Node.js: `npm install` (já executado)
- ⏳ Machine Learning Python: `pip install -r requirements.txt`

---

## 📦 Estrutura de Arquivos

```
DSM-P6-G05-2025-2/
├── back/                          # Backend Node.js
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── userController.js
│   │   │   ├── gameController.js       ✨ NOVO
│   │   │   └── recommendationController.js  ✨ NOVO
│   │   ├── models/
│   │   │   └── userModel.js
│   │   ├── routes/
│   │   │   ├── userRoutes.js
│   │   │   ├── gameRoutes.js          ✨ NOVO
│   │   │   └── recommendationRoutes.js ✨ NOVO
│   │   ├── middleware/
│   │   │   ├── flaskProxy.js          ✨ NOVO
│   │   │   └── errorHandler.js        ✨ NOVO
│   │   └── index.js                   (✏️ ATUALIZADO)
│   ├── .env                           ✨ NOVO (Credenciais)
│   ├── .env.example                   ✨ NOVO
│   ├── package.json                   (✏️ ATUALIZADO)
│   └── node_modules/                  (✅ Instalado)
│
├── machine/                           # Python ML Engine
│   ├── .env                           (✅ Credenciais MySQL)
│   ├── api_game.py                    (✅ API Flask)
│   ├── knn_game.py                    (✅ ML Logic)
│   ├── requirements.txt               (✅ Dependências)
│   └── Pre_processamento_PI6.ipynb
│
├── front/                             # Next.js Frontend
│   ├── lib/
│   │   └── api.ts                     ✨ NOVO (API Client)
│   ├── .env.local                     ✨ NOVO (Configuração)
│   ├── .env.example                   ✨ NOVO
│   └── package.json
│
└── mobile/                            # React Native Expo
    └── game-list/
        ├── src/
        │   └── services/
        │       └── api.ts             (✏️ ATUALIZADO)
        ├── .env.local                 ✨ NOVO
        ├── .env.example               ✨ NOVO
        └── package.json
```

---

## 🔧 Instalação e Configuração

### Passo 1: Verificar Banco de Dados

Conecte ao Azure MySQL para verificar se a tabela `games` existe:

```bash
# Windows - Usar Azure Data Studio ou MySQL Workbench
# Credenciais:
# Host: 13.68.75.61
# User: claudio
# Password: FatecFranca123#
# Database: PI6DSM
```

### Passo 2: Instalar Dependências Python

```bash
cd machine
pip install -r requirements.txt
```

### Passo 3: Configurar Frontend (Next.js)

```bash
cd front
npm install  # Se não estiver instalado
```

### Passo 4: Configurar Mobile (Expo)

```bash
cd mobile/game-list
npm install  # Se não estiver instalado
```

---

## ▶️ Como Rodar o Projeto

### **Opção 1: Terminal Separado para Cada Serviço (RECOMENDADO)**

#### Terminal 1 - Backend Node.js (PORT 3000)

```bash
cd back
npm run dev
# Esperado: 🚀 Backend Gateway iniciado com sucesso!
# 📍 Ouvindo em: http://localhost:3000
```

#### Terminal 2 - Machine Learning Python (PORT 4000)

```bash
cd machine
python api_game.py
# Esperado: 🚀 Iniciando servidor Flask...
# 📍 Host: 0.0.0.0
# 🔌 Porta: 4000
# 📊 Total de jogos carregados: [X]
```

#### Terminal 3 - Frontend Next.js (PORT 3001)

```bash
cd front
npm run dev
# Esperado: ▲ Next.js 15.5.4
# 📍 Local: http://localhost:3001
```

#### Terminal 4 - Mobile Expo (PORT 8081)

```bash
cd mobile/game-list
npm start
# Esperado: Expo DevTools running on *** Your LAN IP / localhost
```

---

### **Opção 2: Usando Concurrently (Todos em Um Terminal)**

```bash
# Apenas para Backend + Flask
cd back
npm run server

# Isso executará ambos paralelamente:
# - npm run dev (Backend Node.js)
# - npm run flask (Python Flask)
```

---

## 🧪 Testando a Integração

### 1️⃣ Verificar Saúde do Sistema

```bash
# Abrir no navegador ou usar curl
curl http://localhost:3000/api/recommendations/system/health
```

**Resposta esperada:**

```json
{
  "sucesso": true,
  "backend": "online",
  "flask": {
    "status": "healthy",
    "service": "games-recommendation-api",
    "jogos_carregados": 50000,
    "modelo_treinado": true,
    "versao": "2.0-mysql"
  }
}
```

### 2️⃣ Criar um Usuário

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "senha123",
    "confirmarSenha": "senha123",
    "categorias": ["Action", "Adventure", "Indie", "Sports"]
  }'
```

### 3️⃣ Fazer Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

### 4️⃣ Buscar Jogos por Categorias

```bash
curl "http://localhost:3000/api/games/categories?cat1=Action&cat2=Adventure&cat3=Indie&cat4=Sports&limit=10"
```

### 5️⃣ Registrar Avaliação

```bash
curl -X POST http://localhost:3000/api/games/1/rate \
  -H "Content-Type: application/json" \
  -d '{"positiva": true}'
```

### 6️⃣ Obter Recomendações do Usuário

```bash
curl "http://localhost:3000/api/recommendations/users/1?limit=10"
```

---

## 📡 Endpoints Disponíveis

### Autenticação (PREFIX: `/api/users`)

- `POST /` - Cadastrar novo usuário
- `POST /login` - Fazer login
- `GET /` - Listar todos os usuários
- `GET /categories` - Listar categorias válidas

### Jogos (PREFIX: `/api/games`)

- `GET /` - Listar todos os jogos (com paginação)
- `GET /:id` - Buscar jogo por ID
- `GET /search?q=termo` - Buscar jogo por nome
- `GET /categories?cat1=...&cat2=...&cat3=...&cat4=...` - Filtrar por categorias
- `GET /aleatorio` - Jogo aleatório
- `POST /:id/rate` - Registrar avaliação

### Recomendações (PREFIX: `/api/recommendations`)

- `GET /users/:userId` - Recomendações personalizadas
- `GET /ranking/popular?limit=10` - Jogos populares
- `GET /ranking/best?limit=10` - Melhores avaliados
- `GET /games/:id/similar?limit=5` - Jogos similares
- `GET /system/health` - Status do sistema

---

## 🔑 Variáveis de Ambiente

### Backend (back/.env)

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=seu_secret_jwt_aqui_min_32_chars

# Flask Service
FLASK_HOST=localhost
FLASK_PORT=4000

# MySQL
AZURE_MYSQL_HOST=13.68.75.61
AZURE_MYSQL_DATABASE=PI6DSM
AZURE_MYSQL_USER=claudio
AZURE_MYSQL_PASSWORD=FatecFranca123#
AZURE_MYSQL_PORT=3306

# URLs
FRONTEND_URL=http://localhost:3000
MOBILE_URL=exp://localhost:8081
```

### Machine (machine/.env) - JÁ CONFIGURADO

```env
FLASK_HOST=0.0.0.0
FLASK_PORT=4000
FLASK_DEBUG=False

AZURE_MYSQL_HOST=13.68.75.61
AZURE_MYSQL_DATABASE=PI6DSM
AZURE_MYSQL_USER=claudio
AZURE_MYSQL_PASSWORD=FatecFranca123#
AZURE_MYSQL_PORT=3306
```

### Frontend (front/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_FLASK_URL=http://localhost:4000
```

### Mobile (mobile/game-list/.env.local)

```env
# Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api

# Para device físico ou iOS:
# EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api (substitua pelo IP)
```

---

## ⚠️ Troubleshooting

### Backend não conecta ao Flask

```
Erro: ECONNREFUSED 127.0.0.1:4000
Solução:
1. Verifique se Flask está rodando (Terminal 2)
2. Verifique se FLASK_HOST e FLASK_PORT em .env estão corretos
3. Reinicie ambos os serviços
```

### Flask não conecta ao MySQL

```
Erro: ❌ Erro ao conectar ao MySQL
Solução:
1. Verifique credenciais em machine/.env
2. Teste a conexão direto: mysql -h 13.68.75.61 -u claudio -p
3. Verifique firewall/network policies
4. Confirme que a tabela 'games' existe no database PI6DSM
```

### Mobile não conecta ao Backend

```
Erro: Network request failed
Solução:
1. Verifique .env.local - use 10.0.2.2 para Android emulator
2. Para device físico: use http://192.168.x.x:3000 (IP da máquina)
3. Verifique firewall da máquina
4. No iOS, pode precisar de certificado SSL
```

### Porta já em uso

```
Erro: listen EADDRINUSE :::3000
Solução:
# Windows - Encontrar processo usando porta
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

---

## 📚 Fluxo de Uso Completo

### 1. Usuário abre o app mobile

```
App Expo carrega → Conecta a http://localhost:3000/api
```

### 2. Usuário faz cadastro

```
Mobile → POST /api/users
Backend (Node.js) → Valida dados
Backend → Armazena em memory (UserModel)
```

### 3. Usuário faz login

```
Mobile → POST /api/users/login
Backend → Valida credenciais
Backend → Retorna dados do usuário com categorias
```

### 4. Usuário vê jogos personalizados

```
Mobile → GET /api/recommendations/users/1
Backend → Recupera categorias do usuário (1-4)
Backend → Proxy para Flask com categorias
Flask → Busca games no MySQL
Flask → Filtra por categorias
Flask → Ordena por nota média
Backend → Retorna top 10 para mobile
```

### 5. Usuário avalia um jogo

```
Mobile → POST /api/games/{gameId}/rate with {positiva: true}
Backend → Proxy para Flask
Flask → UPDATE MySQL (incrementa positive count)
Flask → Retreina modelo KNN
Flask → Retorna sucesso
Backend → Retorna para mobile
```

### 6. Usuário recebe novas recomendações

```
Sistema automático:
Sempre que há nova avaliação, o modelo é retreinado
Próximas requisições já usam modelo atualizado
```

---

## 🎯 Próximas Melhorias

- [ ] Implementar autenticação JWT completa
- [ ] Adicionar cache Redis para recomendações
- [ ] Implementar rate limiting
- [ ] Adicionar logging centralizado (Winston/Morgan)
- [ ] Testes unitários com Jest
- [ ] Docker containers para facilitar deploy
- [ ] CI/CD com GitHub Actions
- [ ] Documentação Swagger/OpenAPI

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs em cada terminal
2. Confirme que todas as credenciais em `.env` estão corretas
3. Teste endpoints com Postman/Insomnia
4. Verifique conectividade MySQL: `mysql -h 13.68.75.61 -u claudio -p`

---

**Status:** ✅ Sistema pronto para integração!

Última atualização: 14 de Novembro de 2025
