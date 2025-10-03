# Backend
backend to PI 6º Semester

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
