# Documentação do Backend

## Visão Geral
- **Stack:** Node.js, Express e arquitetura MVC simples.
- **Contexto:** Serviço expõe rotas de usuários (`/api/users`) e registros (`/api/entries`). Os dados são mantidos em memória durante a execução.
- **Objetivo:** Centralizar cadastro de usuários com preferências de categorias e coletar registros básicos com nome, idade e valor.

## Requisitos e Setup
- **Node.js:** 18.x ou superior recomendado.
- **Dependências:** instale com `npm install` na pasta `back/`.
- **Execução:**
  - Ambiente padrão: `npm start` (inicia servidor na porta `3000`).
  - Ambiente de desenvolvimento com recarga: `npm run dev` (usa `nodemon`).
- **Variáveis de ambiente:**
  - `PORT` (opcional) define a porta do servidor. Sem esta variável usa `3000`.
- **Dataset de categorias:** o arquivo `machine/baseGames_limpa_sem_appid.csv` deve permanecer acessível para que as categorias válidas sejam carregadas em memória no boot da API.

## Estrutura de Pastas (resumo)
```
back/
  src/
    index.js            # bootstrap da API Express e mapeamento das rotas
    controllers/        # regras de validação e orquestração entre rotas e modelos
    models/             # armazenamento em memória dos usuários e registros
    routes/             # definem os endpoints expostos
  docs/                 # documentação e diagramas
  package.json          # scripts e dependências
```

## Fluxo Alto Nível
1. `src/index.js` inicia o Express, registra JSON body parser e monta os routers.
2. `userController` carrega categorias válidas do CSV, valida payload de criação e orquestra persistência em `UserModel`.
3. `entryController` valida o corpo do registro e delega a `EntryModel` para armazenar.
4. Os modelos (`UserModel` e `EntryModel`) guardam os dados em arrays na memória do processo.

## API REST
Todas as rotas aceitam/retornam JSON e estão sob o prefixo `/api`.

### Sumário de Endpoints
| Método | Rota | Descrição |
|--------|------|-----------|
| GET    | `/api/users` | Lista usuários cadastrados (sem hash de senha).
| GET    | `/api/users/categories` | Retorna categorias válidas derivadas do CSV.
| POST   | `/api/users` | Cria novo usuário com validações completas.
| GET    | `/api/entries` | Lista registros cadastrados.
| POST   | `/api/entries` | Cria novo registro simples.

### Detalhes por Recurso

#### `GET /api/users`
- **Uso:** consultar todos os usuários ativos.
- **Resposta 200:**
```json
{
  "dados": [
    {
      "id": 1,
      "nome": "Ana",
      "email": "ana@example.com",
      "categorias": ["Action", "Indie"],
      "criadoEm": "2025-07-01T12:34:56.789Z"
    }
  ]
}
```

#### `GET /api/users/categories`
- **Uso:** obter a lista de categorias aceitas no cadastro de usuário.
- **Resposta 200:**
```json
{
  "categorias": [
    "Action",
    "Adventure",
    "Indie"
  ]
}
```
- Lista é ordenada alfabeticamente.

#### `POST /api/users`
- **Headers obrigatórios:** `Content-Type: application/json`.
- **Payload esperado:**
```json
{
  "nome": "Ana",
  "email": "ana@example.com",
  "senha": "segredo123",
  "confirmarSenha": "segredo123",
  "categorias": ["Action", "Indie"]
}
```
- **Validações aplicadas:**
  - `nome`: string não vazia.
  - `email`: string com formato válido e único (conferido em memória).
  - `senha`: string ≥ 6 caracteres; `confirmarSenha` deve coincidir.
  - `categorias`: array com pelo menos um item string; itens devem existir na lista carregada do CSV.
- **Resposta 201:**
```json
{
  "mensagem": "Usuário criado com sucesso.",
  "dados": {
    "id": 1,
    "nome": "Ana",
    "email": "ana@example.com",
    "categorias": ["Action", "Indie"],
    "criadoEm": "2025-07-01T12:34:56.789Z"
  }
}
```
- **Erros comuns:**
  - 400: corpo inválido ou campos faltando/fora do padrão (retorna array `erros`).
  - 409: email já cadastrado (`{"mensagem": "Usuário com esse email já existe."}`).

#### `GET /api/entries`
- **Uso:** listar registros simples já enviados.
- **Resposta 200:**
```json
{
  "dados": [
    {
      "id": 1,
      "nome": "Relatório 1",
      "idade": 21,
      "valor": 150.5,
      "criadoEm": "2025-07-01T12:34:56.789Z"
    }
  ]
}
```

#### `POST /api/entries`
- **Headers obrigatórios:** `Content-Type: application/json`.
- **Payload esperado:**
```json
{
  "nome": "Relatório 1",
  "idade": 21,
  "valor": 150.5
}
```
- **Validações aplicadas:**
  - `nome`: string não vazia.
  - `idade`: obrigatória, convertível para número.
  - `valor`: obrigatório, convertível para número.
- **Resposta 201:**
```json
{
  "mensagem": "Registro criado com sucesso.",
  "dados": {
    "id": 1,
    "nome": "Relatório 1",
    "idade": 21,
    "valor": 150.5,
    "criadoEm": "2025-07-01T12:34:56.789Z"
  }
}
```
- **Erros comuns:**
  - 400: campos ausentes ou não numéricos (retorna array `erros`).

### Tratamento de Erros Globais
- Rota inexistente responde 404 com `{"mensagem": "Rota não encontrada."}`.
- Categorias não carregadas (falha no CSV) resultam em validação permissiva (qualquer categoria é aceita), mas um aviso é logado no servidor.

## Segurança e Senhas
- Senhas são convertidas em hash PBKDF2 (`sha512`, 100000 iterações) com salt aleatório armazenado.
- Hash e salt permanecem apenas em memória; a API não retorna esses campos.
- Não há autenticação de sessão/token implementada.

## Dados em Memória
- Reiniciar o processo limpa todos os dados criados.
- Para persistência real, substitua os arrays em `UserModel` e `EntryModel` por integração com banco relacional ou NoSQL.

## Mini MER
Representa o modelo conceitual atual (dados independentes em memória):
```
+-------------+       +-------------+
|   Usuário   |       |   Registro  |
+-------------+       +-------------+
| id          |       | id          |
| nome        |       | nome        |
| email       |       | idade       |
| categorias  |       | valor       |
| criadoEm    |       | criadoEm    |
+-------------+       +-------------+
```
- Não há relacionamento obrigatório entre usuários e registros no código atual.

### Mini DER (sugestão lógica)
Possível evolução para ligar registros a usuários (1:N opcional):
```
@startuml
entity "users" as Users {
  *id : INTEGER
  nome : VARCHAR
  email : VARCHAR
  categorias : TEXT
  password_hash : VARCHAR
  salt : VARCHAR
  criado_em : DATETIME
}

entity "entries" as Entries {
  *id : INTEGER
  nome : VARCHAR
  idade : INTEGER
  valor : DECIMAL
  criado_em : DATETIME
  user_id : INTEGER
}

Users ||--o{ Entries : "possui"
@enduml
```
- `user_id` é opcional (nulo) para manter compatibilidade com o comportamento atual.
- `categorias` pode ser armazenado em formato JSON ou normalizado em tabela auxiliar.

## Exemplos de Uso (curl)
```powershell
# Criar usuário
curl -X POST http://localhost:3000/api/users \ 
  -H "Content-Type: application/json" \ 
  -d '{
        "nome": "Ana",
        "email": "ana@example.com",
        "senha": "segredo123",
        "confirmarSenha": "segredo123",
        "categorias": ["Action", "Indie"]
      }'

# Listar registros
curl http://localhost:3000/api/entries
```

## Próximos Passos Recomendados
- Adicionar persistência real (DB) e autenticação JWT.
- Expandir documentação com testes automatizados (jest/supertest) e exemplos de erros.
- Publicar versões geradas dos diagramas (PNG/SVG) em `back/docs` usando PlantUML.
