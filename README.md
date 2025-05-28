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

Para encerrar o banco abruptamente e apagar os resgistros da tabela clients, execute os comandos abaixo:
OBS: comandos para o CMD

```bash
taskkill /F /IM postgres.exe
net start postgresql-x64-17
```

Ou utilize para executar os comandos sql e em seguida limpar a tabela clients a fim de simular o crash

```bash
node run_transactions.js ./datafiles/test.sql crash
```

Para executar o Redo execute o comando:

```bash
node redo.js
```
