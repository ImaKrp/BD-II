const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("dotenv").config();

const relativePath = process.argv[2];

if (!relativePath) {
  console.error("Erro: forneça o caminho relativo do arquivo como argumento.");
  process.exit(1);
}

const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const databaseHandler = async (scopes) => {
  const validOps = {};
  const invalidOps = {};

  scopes.forEach((txt, i) => {
    if (txt.toUpperCase().includes("END;")) validOps[i] = txt;
    else invalidOps[i] = txt;
  });

  Object.keys(invalidOps).forEach((key) => {
    const txt = invalidOps[key];

    const lines = [];
    txt
      .split("\n")
      .filter((line) => line.trim())
      .forEach((line, i) => {
        if (i < 2) {
          lines.push(line);
        }

        console.log();

        const [op, ...rest] = line.split(" ");

        if (op.toUpperCase() === "INSERT") {
        }
        if (op.toUpperCase() === "DELETE") {
        }
        if (op.toUpperCase() === "UPDATE") {
        }

        console.log(op, rest);
      });

    lines.push(`END;`);
    invalidOps[key] = lines.join("\n");
  });

  console.log(invalidOps);

  try {
    await client.connect();
    for (let i = 0; i < scopes.length; i++) {
      console.log(i);
      try {
        let transaction = validOps[i];
        if (invalidOps?.[i]) {
          continue;
        }

        await client.query(transaction);
        console.log(`✓ Sucesso da transação ${i}`);
      } catch (err) {
        console.error(`✗ Erro na execução da transação ${i}:`, err.message);
      }
    }
  } finally {
    await client.end();
  }
};

const absPath = path.resolve(__dirname, relativePath);
fs.readFile(absPath, "utf8", (err, data) => {
  if (err) {
    console.error("Erro ao ler o arquivo:", err);
    return;
  }
  const scopes = [];

  let currentIndex = 0;
  data
    .split("\n")
    .filter((line) => line.trim())
    .forEach((line, i) => {
      const upper = line.trim().toUpperCase();

      if (upper === "BEGIN;") {
        if (i > 0 && scopes?.length > 0) {
          currentIndex++;
        }

        scopes.push(line);
        scopes[
          currentIndex
        ] += `\nINSERT INTO clients_log(type, transaction_id) VALUES ('START', txid_current());`;
      } else if (upper === "END;") {
        scopes[currentIndex] +=
          `\nINSERT INTO clients_log(type, transaction_id) VALUES ('COMMIT', txid_current());\n` +
          line;
      } else {
        scopes[currentIndex] += `\n` + line;
      }
    });

  // scopes.forEach((txt, i) => {
  //   if (i > 0) console.log("\n------- ------- ------- ------- -------\n");
  //   console.log(txt);
  // });

  databaseHandler(scopes);
});
