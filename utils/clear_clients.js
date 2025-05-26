module.exports = `
    DROP TABLE clients;

    CREATE UNLOGGED TABLE clients (
    id SERIAL PRIMARY KEY,
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
`;
