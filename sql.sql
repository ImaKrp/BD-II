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

CREATE OR REPLACE FUNCTION client_update()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO clients_log(type, transaction_id, client_id, name, balance)
    VALUES ('UPDATE', txid_current(), NEW.id, NEW.name, NEW.balance);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_client_update
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION client_update();

CREATE OR REPLACE FUNCTION client_delete()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO clients_log(type, transaction_id, client_id, name, balance)
    VALUES ('DELETE', txid_current(), OLD.id, OLD.name, OLD.balance);

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_client_delete
BEFORE DELETE ON clients
FOR EACH ROW
EXECUTE FUNCTION client_delete();

CREATE OR REPLACE FUNCTION add_commit()
RETURNS void AS $$
BEGIN
    INSERT INTO clients_log (type, transaction_id, client_id, name, balance)
    VALUES ('COMMIT', txid_current(), NULL, NULL, NULL);
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER trigger_commit
ON COMMIT
EXECUTE FUNCTION add_commit();