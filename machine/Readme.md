# 📘 GAME LIST — Sistema de Recomendação de Jogos

[![status](https://img.shields.io/badge/status-active-brightgreen)](https://github.com/)
[![python](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![license](https://img.shields.io/badge/license-MIT-lightgrey)](./LICENSE)

**Game List** é um sistema de recomendação de jogos que combina uma API REST em Flask, um modelo de similaridade KNN para recomendações, banco MySQL hospedado na Azure e mensageria assíncrona com Google Cloud Pub/Sub. Este README documenta instalação, configuração, execução, endpoints e arquitetura do sistema.

---

## 📂 Índice
1. [Visão Geral](#-visão-geral)  
2. [Estrutura do Projeto](#-estrutura-do-projeto)  
3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)  
4. [Instalação das Dependências](#-instalação-das-dependências)  
5. [Configuração das Variáveis de Ambiente (.env)](#-configuração-das-variáveis-de-ambiente-env)  
6. [Banco de Dados (MySQL Azure) — Schema](#-banco-de-dados-mysql-azure---schema)  
7. [Configuração do Google Cloud Pub/Sub](#-configuração-do-google-cloud-pubsub)  
8. [Execução (desenvolvimento/produção)](#-execução-desenvolvimentoprodução)  
9. [Fluxo de Avaliação (pub/sub)](#-fluxo-de-avaliação-pubsub)  
10. [Documentação da API (completa)](#-documentação-da-api-completa)  
11. [Testes rápidos](#-testes-rápidos)  
12. [Troubleshooting](#-troubleshooting)  
13. [Segurança](#-segurança)  
14. [Licença & Autor](#-licença--autor)

---

## 📘 Visão Geral

O sistema permite:
- Listar jogos, buscar por nome ou categoria;
- Obter recomendações por similaridade (modelo **KNN**);
- Receber avaliações de usuários de forma assíncrona via **Google Pub/Sub**;
- Atualizar métricas e históricos no **MySQL Azure** por meio de um worker.

O fluxo principal:
- A API publica mensagens de avaliação no tópico Pub/Sub.
- O `pubsub_worker.py` consome mensagens, persiste em `game_ratings` e atualiza contadores em `games`.
- Recomendações são geradas pelo modelo treinado KNN (ex.: `knn_model.pkl` / `knn_game.py`).

---

## 📁 Estrutura do Projeto (exemplo)

```
machine/
├── .env                   # Variáveis de ambiente (não versionar)
├── api_game.py            # API Flask (endpoints)
├── knn_game.py            # Algoritmo de recomendação
├── pubsub_chave.json      # Chave JSON do Service Account
├── pubsub_publish.py      # Função de publicação das mensagens Pub/Sub
├── pubsub_test.py         # Função teste de publicação das mensagens Pub/Sub
├── pubsub_worker.py       # Worker que consome mensagens Pub/Sub
├── Readme.md              # Documentação do projeto
├── requirements.txt       # Dependências do Python
└── others/
    └─ "Todos os arquivos" # Arquivos auxiliares (pré processamento, etc.)
```

---

## 🧰 Tecnologias Utilizadas

**Backend**
- Python 3.10+
- Flask (+ Flask-CORS)
- Pandas, NumPy
- scikit-learn (KNN)
- mysql-connector-python (ou SQLAlchemy, conforme implementação)

**Infraestrutura**
- Azure Virtual Machine (onde roda a API / worker)
- Azure Database for MySQL (Flexible Server ou Single Server)
- Google Cloud Pub/Sub (publisher + subscriber)

---

## ⚙️ Instalação das Dependências

Clone o repositório e instale dependências:

```bash
git clone https://github.com/cldmatos/DSM-P6-G05-2025-2.git
cd DSM-P6-G05-2025-2
cd machine
python -m venv .venv
source .venv/bin/activate   # ou .venv\\Scripts\\activate no Windows
pip install -r requirements.txt
```

---

## 🔐 Configuração das Variáveis de Ambiente (.env)

Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo (exemplo):

```env
# Flask API
FLASK_HOST=0.0.0.0
FLASK_PORT=4000
FLASK_DEBUG=False

# MySQL Azure
AZURE_MYSQL_HOST=seu-host.mysql.database.azure.com
AZURE_MYSQL_DATABASE=game_list
AZURE_MYSQL_USER=seu_usuario
AZURE_MYSQL_PASSWORD=sua_senha
AZURE_MYSQL_PORT=3306

# Google Cloud Pub/Sub
GOOGLE_APPLICATION_CREDENTIALS=/caminho/credenciais.json
GCP_PUBSUB_PROJECT_ID=seu-projeto
GCP_PUBSUB_TOPIC_NAME=projects/seu-projeto/topics/games
GCP_PUBSUB_SUB_NAME=projects/seu-projeto/subscriptions/games-sub
PUBSUB_TOPIC=avaliacao_jogos
PUBSUB_SUBSCRIPTION=avaliacao_subscription
```

> ⚠ **Nunca** comite `.env` ou a chave JSON no repositório.

---

## 🗄️ Banco de Dados (MySQL Azure) — Schema

A seguir um schema de exemplo (execute com cuidado na sua base):

```sql
CREATE TABLE `games` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `release_date` date DEFAULT NULL,
  `required_age` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `header_image` varchar(300) DEFAULT NULL,
  `positive` int DEFAULT 0,
  `negative` int DEFAULT 0,
  `recommendations` int DEFAULT 0,
  `genres` varchar(255) DEFAULT NULL,
  `categories` varchar(255) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`)
);

CREATE TABLE `game_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `game_id` int NOT NULL,
  `evaluation` ENUM('positive','negative') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_rating_game FOREIGN KEY (game_id) REFERENCES games(id)
);
```

---

## ☁️ Configuração do Google Cloud Pub/Sub

1. Crie um **Topic**:
```
gcloud pubsub topics create games
# ou: projects/<PROJECT_ID>/topics/games
```

2. Crie uma **Subscription**:
```
gcloud pubsub subscriptions create games-sub --topic=games
# ou: projects/<PROJECT_ID>/subscriptions/games-sub
```

3. Gere uma **chave JSON** para uma Service Account com permissões:
- roles/pubsub.publisher
- roles/pubsub.subscriber

No `.env` informe:
```env
GOOGLE_APPLICATION_CREDENTIALS=/caminho/da/sua-chave.json
```

---

## 🚀 Execução

Existem duas peças a rodar em paralelo: **API** e **Worker**. Exemplo (Linux/macOS):

```bash
# dentro do virtualenv
python api_game.py & python pubsub_worker.py
```

Ou execute em terminais separados:

Terminal 1:
```bash
python api_game.py
```

Terminal 2:
```bash
python pubsub_worker.py
```

A API, por padrão, estará em: `http://localhost:4000/` (conforme `FLASK_PORT`).

---

## 🔁 Fluxo Completo da Avaliação

1. Cliente envia:
```
POST /avaliacao/positiva
{
  "user_id": 123,
  "jogo_id": 42
}
```

2. API publica mensagem JSON no tópico Pub/Sub:
```json
{
  "user_id": 123,
  "jogo_id": 42,
  "evaluation": "positive"
}
```

3. `pubsub_worker.py` consome a mensagem:
- Verifica se este usuário já avaliou o jogo;
- Insere/atualiza registro em `game_ratings`;
- Atualiza contadores `games.positive` ou `games.negative`.

---

## 📄 Documentação da API 

### Sumário de Endpoints

- Status e Saúde
  - GET /
  - GET /health
  - GET /status

- Jogos
  - GET /jogos
  - GET /jogos/<jogo_id>
  - GET /jogos/busca/<nome>
  - GET /jogos/categorias
  - GET /jogos/aleatorio
  - GET /jogos/<jogo_id>/recomendacoes

- Rankings
  - GET /ranking/populares
  - GET /ranking/melhores

- Avaliações
  - POST /avaliacao/positiva
  - POST /avaliacao/negativa

---

### 1. Status e Saúde

**GET /**  
Descrição: Retorna mensagem de boas-vindas, versão, status e total de jogos carregados.

Exemplo de resposta:
```json
{
  "message": "🎮 API de Recomendação de Games - Online!",
  "version": "2.0",
  "status": "operacional",
  "total_jogos": 1234
}
```

**GET /health**  
Descrição: Verifica a saúde do serviço.

Exemplo de resposta:
```json
{
  "status": "healthy",
  "jogos_carregados": 1234,
  "modelo_treinado": true
}
```

**GET /status**  
Descrição: Retorna status operacional, total de jogos e avaliações.

Exemplo de resposta:
```json
{
  "status": "operational",
  "jogos": 1234,
  "avaliacoes_totais": 5678
}
```

---

### 2. Jogos

**GET /jogos**  
Descrição: Lista jogos cadastrados, com paginação.

Parâmetros de query:
- `limite` (opcional, padrão: 50): Quantidade de jogos por página.
- `pagina` (opcional, padrão: 1): Número da página.

Exemplo de requisição: `GET /jogos?limite=10&pagina=2`

Exemplo de resposta:
```json
{
  "jogos": [ /* lista de jogos */ ],
  "pagina": 2,
  "limite": 10,
  "total": 1234,
  "paginas_total": 124
}
```

**GET /jogos/<jogo_id>**  
Descrição: Busca um jogo pelo seu ID.

Exemplo de requisição: `GET /jogos/42`

Exemplo de resposta:
```json
{
  "id": 42,
  "nome": "Super Game",
  "categoria": "Aventura"
}
```

Se não encontrado:
```json
{ "error": "Jogo não encontrado" }
```

**GET /jogos/busca/<nome>**  
Descrição: Busca jogos pelo nome (parcial ou completo).

Exemplo de requisição: `GET /jogos/busca/mario`

Exemplo de resposta:
```json
{
  "resultados": [ /* lista de jogos */ ],
  "total": 2,
  "busca": "mario"
}
```

**GET /jogos/categorias**  
Descrição: Busca jogos por até 4 categorias.

Parâmetros de query:
- `cat1, cat2, cat3, cat4`: Nomes das categorias (ao menos uma obrigatória)
- `limite` (opcional, padrão: 10): Limite de resultados

Exemplo: `GET /jogos/categorias?cat1=RPG&cat2=Aventura&limite=5`

Resposta:
```json
{
  "categorias_buscadas": ["RPG", "Aventura"],
  "jogos": [ /* lista de jogos */ ],
  "total": 5,
  "limite": 5
}
```

Se nenhuma categoria for informada:
```json
{ "error": "Pelo menos uma categoria é necessária" }
```

**GET /jogos/aleatorio**  
Descrição: Retorna um jogo aleatório.

Resposta:
```json
{
  "id": 99,
  "nome": "Jogo Aleatório"
}
```

**GET /jogos/<jogo_id>/recomendacoes**  
Descrição: Retorna recomendações de jogos similares ao jogo informado.

Parâmetros de query:
- `limite` (opcional, padrão: 5): Quantidade de recomendações

Exemplo: `GET /jogos/42/recomendacoes?limite=3`

Resposta:
```json
{
  "jogo_base_id": 42,
  "recomendacoes": [ /* lista de jogos recomendados */ ],
  "total": 3
}
```

---

### 3. Rankings

**GET /ranking/populares**  
Descrição: Retorna ranking dos jogos mais populares.

Query:
- `limite` (opcional, padrão: 10)

**GET /ranking/melhores**  
Descrição: Retorna ranking dos jogos melhor avaliados.

Query:
- `limite` (opcional, padrão: 10)
- `min_avaliacoes` (opcional, padrão: 5)

Exemplo de resposta:
```json
{
  "ranking": "melhores",
  "jogos": [ /* lista de jogos */ ],
  "total": 3,
  "min_avaliacoes": 10
}
```

---

### 4. Avaliações

**POST /avaliacao/positiva**  
Descrição: Envia uma avaliação positiva de um usuário para um jogo.

Body (JSON):
```json
{
  "user_id": 123,
  "jogo_id": 42
}
```

Exemplo de resposta:
```json
{
  "message": "Avaliação POSITIVA enviada para processamento",
  "status": "enviado_pubsub",
  "message_id": "abcdef123456",
  "dados": {
    "user_id": 123,
    "game_id": 42,
    "evaluation": "positive"
  }
}
```

Se faltar campos obrigatórios:
```json
{ "error": "jogo_id e user_id são obrigatórios" }
```

**POST /avaliacao/negativa**  
Descrição: Envia uma avaliação negativa de um usuário para um jogo.

Body (JSON):
```json
{
  "user_id": 123,
  "jogo_id": 42
}
```

Exemplo de resposta:
```json
{
  "message": "Avaliação NEGATIVA enviada para processamento",
  "status": "enviado_pubsub",
  "message_id": "abcdef654321",
  "dados": {
    "user_id": 123,
    "game_id": 42,
    "evaluation": "negative"
  }
}
```

Se faltar campos obrigatórios:
```json
{ "error": "jogo_id e user_id são obrigatórios" }
```

**Observações**
- Todos os endpoints retornam JSON.
- Rotas de avaliação processadas de forma assíncrona via Pub/Sub.
- Em caso de erro, a resposta possui campo `error` com HTTP status apropriado.

---

## 🛠 Troubleshooting (comuns)

- **Connection Refused**: API não rodando / porta bloqueada / rodou `knn_game.py` ao invés de `api_game.py`.  
- **Pub/Sub sem mensagens**: `GOOGLE_APPLICATION_CREDENTIALS` não definido / tópico/subscription errado / permissões insuficientes.  
- **MySQL Access Denied**: IP da VM não liberado no firewall do Azure / senha incorreta / porta 3306 bloqueada.

---

## 🔒 Segurança

- Não versionar `.env` nem a chave JSON.
- Limitar exposição do MySQL (firewall, regras de rede).
- Use Service Accounts com permissões mínimas (principle of least privilege).
- Habilite TLS na conexão ao Azure MySQL (recomendado).

---

## 🏗 Arquitetura (diagrama ASCII)

```
           ┌───────────────────────────┐
           │        Usuários / App     │
           └─────────────┬─────────────┘
                         │ HTTP/JSON
                         ▼
             ┌──────────────────────────┐
             │      API Flask (VM Azure)│
             │   Endpoints + Publicador │
             └───────────┬──────────────┘
                         │ publica mensagens
                         ▼
           ┌────────────────────────────────┐
           │       Google Pub/Sub           │
           │  tópico: games / avaliacao_jogos│
           └───────────┬────────────────────┘
                       │ entrega
                       ▼
          ┌──────────────────────────────────┐
          │         Worker (pubsub)          │
          │ consome mensagens e atualiza DB  │
          └──────────────────┬───────────────┘
                             │
                             ▼
                 ┌──────────────────────┐
                 │     MySQL Azure      │
                 └──────────────────────┘
```

---

## 📦 Observações finais

- O modelo KNN deve ser treinado offline (ex.: `knn_game.py`) e salvo (`models/knn_model.pkl`).
- Os endpoints de recomendação consultam o modelo salvo para gerar similaridade.
- Caso queira, posso adicionar exemplos de payloads, Postman collection ou Dockerfile para deploy.

---

## 📄 Licença

MIT

---

## ✨ Autor

Claudio Matos
