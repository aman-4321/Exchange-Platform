const { Client } = require("pg");

const client = new Client({
  user: "user",
  host: "localhost",
  database: "database",
  password: "password",
  port: 5432,
});

async function initializeDB() {
  await client.connect();

  await client.query(`
    DROP TABLE IF EXISTS "tata_prices";
    CREATE TABLE "tata_prices"(
      time            TIMESTAMP WITH TIME ZONE NOT NULL,
      price   DOUBLE PRECISION,
      volume      DOUBLE PRECISION,
      currency_code   VARCHAR (10)
    );
  `);

  await client.query(`
    SELECT create_hypertable('tata_prices', 'time', 'price', 2);
  `);

  await client.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1m AS
    SELECT
      time_bucket('1 minute', time) AS bucket,
      first(price, time) AS open,
      max(price) AS high,
      min(price) AS low,
      last(price, time) AS close,
      sum(volume) AS volume,
      currency_code
    FROM tata_prices
    GROUP BY bucket, currency_code;
  `);

  await client.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1h AS
    SELECT
      time_bucket('1 hour', time) AS bucket,
      first(price, time) AS open,
      max(price) AS high,
      min(price) AS low,
      last(price, time) AS close,
      sum(volume) AS volume,
      currency_code
    FROM tata_prices
    GROUP BY bucket, currency_code;
  `);

  await client.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1w AS
    SELECT
      time_bucket('1 week', time) AS bucket,
      first(price, time) AS open,
      max(price) AS high,
      min(price) AS low,
      last(price, time) AS close,
      sum(volume) AS volume,
      currency_code
    FROM tata_prices
    GROUP BY bucket, currency_code;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS trades (
      id SERIAL PRIMARY KEY,
      market VARCHAR NOT NULL,
      price NUMERIC NOT NULL,
      quantity NUMERIC NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS ticker (
      market VARCHAR PRIMARY KEY,
      price NUMERIC NOT NULL,
      last_updated TIMESTAMP WITH TIME ZONE
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id VARCHAR PRIMARY KEY,
      market VARCHAR NOT NULL,
      price NUMERIC NOT NULL,
      quantity NUMERIC NOT NULL,
      executed_qty NUMERIC NOT NULL DEFAULT 0,
      side VARCHAR(4) CHECK (side IN ('buy', 'sell')),
      status VARCHAR(10) DEFAULT 'open'
    );
  `);

  await client.query(`
  CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   username VARCHAR(255) UNIQUE NOT NULL,
   email VARCHAR(255) UNIQUE NOT NULL,
   password TEXT NOT NULL
);
`);

  await client.end();
  console.log("Database initialized successfully");
}

initializeDB().catch(console.error);
