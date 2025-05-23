const fs = require("fs");
const path = require("path");

const relativePath = process.argv[2];

if (!relativePath) {
  console.error("Erro: forneça o caminho relativo do arquivo como argumento.");
  process.exit(1);
}

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
    .filter((line) => line.trim()) // Ignora linhas vazias
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
          `\nINSERT INTO clients_log(type, transaction_id) VALUES ('END', txid_current());\n` +
          line;
      } else {
        scopes[currentIndex] += `\n` + line;
      }
    });

  scopes.forEach((txt, i) => {
    if (i > 0) console.log("\n------- ------- ------- ------- -------\n");
    console.log(txt);
  });
});
