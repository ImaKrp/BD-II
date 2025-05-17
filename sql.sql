CREATE UNLOGGED TABLE clients (
  id SERIAL PRIMARY KEY,
  name TEXT,
  balance NUMERIC
);

CREATE TYPE log_type AS ENUM ('INSERT', 'UPADTE', 'DELETE', 'COMMIT', 'START');

CREATE TABLE clients_log (
  id SERIAL PRIMARY KEY,
  type log_type,
  transaction_id INT,
  client_id INT,
  name TEXT,
  balance NUMERIC
);

CREATE OR REPLACE FUNCTION client_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO clients_log(type, transaction_id, client_id, name, balance)
    VALUES ('INSERT', txid_current(), NEW.id, NEW.name, NEW.balance);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_client_insert
BEFORE INSERT ON clients
FOR EACH ROW
EXECUTE FUNCTION client_insert();