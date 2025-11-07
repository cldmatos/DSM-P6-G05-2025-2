Docs: MER e DER do backend

Arquivos gerados (pasta `back/docs`):
- MER.puml  -> Modelo Entidade-Relacionamento (conceitual)
- DER.puml  -> Diagrama Entidade-Relacionamento (lógico/physical-level suggestion)

Como gerar imagens (PNG/SVG) localmente
- Pré-requisito: Java + PlantUML ou usar um plugin/editor que suporte PlantUML.

Com PlantUML CLI (exemplo gerando PNG):

1) Instalar (se ainda não tiver):
   - Baixe plantuml.jar: https://plantuml.com/pt/download
   - Certifique-se de ter `java` disponível.

2) Gerar PNG:

```powershell
cd back\docs
java -jar path\to\plantuml.jar MER.puml
java -jar path\to\plantuml.jar DER.puml
```

Isso criará `MER.png` e `DER.png` na mesma pasta.

Descrição dos diagramas

MER (conceitual):
- Entidade Usuário
  - id (PK)
  - nome
  - email
  - categorias (array/list)
  - criadoEm

- Entidade Registro/Entrada
  - id (PK)
  - nome
  - idade
  - valor
  - criadoEm

Observação: no design atual do backend (código em `back/src/models`) as duas tabelas são independentes (armazenamento em memória). Se for necessário associar entradas a usuários, recomendo adicionar uma FK `user_id` em `entries` (relação 1:N).

DER (lógico/sugestão física):
- `users` (tabela)
  - id : INTEGER PK AUTOINCREMENT
  - nome : VARCHAR(255) NOT NULL
  - email : VARCHAR(255) NOT NULL UNIQUE
  - categorias : TEXT (JSON) - alternativa: tabela associativa `users_categories`
  - password_hash : VARCHAR(512) NOT NULL
  - salt : VARCHAR(64) NOT NULL
  - criado_em : DATETIME NOT NULL

- `entries` (tabela)
  - id : INTEGER PK AUTOINCREMENT
  - nome : VARCHAR(255) NOT NULL
  - idade : INTEGER
  - valor : DECIMAL(10,2)
  - criado_em : DATETIME NOT NULL
  - (opcional) user_id : INTEGER FK -> users.id

Sugestões rápidas
- Para categorias: armazenar como JSON em `users.categorias` ou criar tabela `categories` + `users_categories(user_id, category_id)` para normalização.
- Para autenticação: não usar `salt` e `password_hash` cru em código de produção; prefira `bcrypt` e TLS.

Se quiser, eu:
- adiciono imagens PNG geradas automaticamente (posso usar uma lib para renderizar, mas prefiro gerar localmente com PlantUML no seu ambiente),
- gero uma versão DER com tabela `categories` normalizada e tabela associativa,
- ou crio SQL DDL (CREATE TABLE ...) pronto para executar.

Diga qual próximo passo prefere.