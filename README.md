## ▶️ Requisitos

Crie o arquivo `.env` na raiz do projeto com os dados do seu banco:

```env
PGUSER=seu_usuario
PGHOST=localhost
PGDATABASE=seu_banco
PGPASSWORD=sua_senha
PGPORT=5432
```

## ▶️ Uso

Execute o script passando o caminho relativo para um arquivo `.sql`:

```bash
node run_transactions.js ./datafiles/test.sql
```
