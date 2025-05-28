const fs = require("fs");
const path = require("path");
const gen_client = require("./utils/db_client");
const recreateSQL = require("./utils/clear_clients");

const recreateTable = process.argv[3] === "crash";

const relativePath = process.argv[2];

if (!relativePath) {
  console.error("Erro: forneça o caminho relativo do arquivo como argumento.");
  process.exit(1);
}

const databaseHandler = async (scopes) => {
  const client = gen_client();
  try {
    await client.connect();
    try {
      await client.query(
        scopes
          .map((txt) => {
            if (txt.toUpperCase().includes("END;")) return txt;
            return txt + `\nEND;`;
          })
          .join("\n")
      );
      console.log("✓ Sucesso");
    } catch (err) {
      console.error("✗ Erro na execução da transação:", err.message);
    }
    if (recreateTable) {
      try {
        await client.query(recreateSQL);
      } catch (err) {
        console.error("✗ Erro limpando a tabela simulando crash");
      }
    }
  } catch {
    console.error("✗ Falha ao conectar com o banco");
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

  scopes.forEach((txt, i) => {
    if (i > 0) console.log("\n------- ------- ------- ------- -------\n");
    console.log(txt);
  });

  databaseHandler(scopes);
});
