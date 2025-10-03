
## Requisitos Funcionais (iniciais)
1.  API deve permitir listar todos os registros.
   - Endpoint: GET /api/entries
2.  API deve permitir criar um registro com os campos `nome`, `idade`, `valor`.
   - Endpoint: POST /api/entries
   - Corpo: JSON { nome: string, idade: number, valor: number }
3. RF03 - Validação básica do payload: tipos obrigatórios e respostas de erro (400) quando inválido.
4. RF04 - Armazenamento em memória (provisório) — reiniciar o servidor limpa os dados.

## Requisitos Não Funcionais (iniciais)
- RNF01 - API deve responder dentro de um tempo razoável (pico de latência < 200ms em ambiente de desenvolvimento).
- RNF02 - Código organizado em arquitetura MVC para facilitar evolução.
- RNF03 - Disponibilizar documentação básica (README) com instruções de execução.

## Critérios de Aceitação
- Ambiente inicial com `npm install` e `npm start` inicia o servidor.
- GET retorna 200 e lista de registros (array). POST retorna 201 e o objeto criado quando payload válido.


