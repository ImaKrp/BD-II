const gen_client = require("./utils/db_client");

const redo_hadler = async () => {
  let rows = [];

  let client = gen_client();

  try {
    await client.connect();

    try {
      const res = await client.query("select * from clients_log;");
      rows = res.rows;
    } catch (e) {
      console.error(
        "✗ Erro na execução do select em clients_log:",
        err.message
      );
    }
  } catch {
    console.error("✗ Falha ao conectar com o banco");
    await client.end();
    return;
  } finally {
    await client.end();
  }

  const commitedTs = rows
    .filter((row) => row.type === "COMMIT")
    .map(({ transaction_id }) => {
      return transaction_id;
    });

  lastTransaction = -1;
  const sql = [
    ...rows
      .filter((row) => commitedTs.includes(row.transaction_id))
      .map(({ type, client_id, name, balance, transaction_id }) => {
        if (lastTransaction != transaction_id) {
          console.log(
            `\n--------Efetuando o redo da transaction ${transaction_id}-------------`
          );
          lastTransaction = transaction_id;
        }
        if (type === "INSERT") {
          comand = `INSERT INTO clients (id, name, balance) VALUES (${client_id}, '${name}', ${Number(
            balance
          ).toFixed(2)});`;

          console.log(comand);
          return comand + "\n";
        }
        if (type === "UPDATE") {
          comand = `UPDATE clients SET balance = ${balance}, name = '${name}' WHERE id = ${client_id};`;

          console.log(comand);
          return comand + "\n";
        }
        if (type === "DELETE") {
          comand = `DELETE FROM clients WHERE id = ${client_id};`;

          console.log(comand);
          return comand + "\n";
        }
        return "";
      }),
    "DELETE FROM clients_log;",
  ];

  client = gen_client();
  try {
    await client.connect();
    try {
      const res = await client.query(sql.join(""));
      rows = res.rows;
    } catch (e) {
      console.error("✗ Erro na execução do redo:", e.message);
    }
  } catch (e) {
    console.log(e);
    console.error("✗ Falha ao conectar com o banco");
  } finally {
    await client.end();
  }
};

redo_hadler();
