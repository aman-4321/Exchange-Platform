import { Client } from "pg";
import { createClient } from "redis";
import { DbMessage } from "./types";

const pgClient = new Client({
  user: "postgres",
  host: "localhost",
  database: "database",
  password: "sh",
  port: 5432,
});
pgClient.connect();

async function main() {
  const redisClient = createClient();
  await redisClient.connect();
  console.log("connected to redis");

  while (true) {
    const response = await redisClient.rPop("db_processor");
    if (!response) continue;

    const data: DbMessage = JSON.parse(response);

    if (data.type === "TRADE_ADDED") {
      const { market, price, timestamp, quantity } = data.data;
      const query = `
        INSERT INTO trades (market, price, quantity, timestamp)
        VALUES ($1, $2, $3, $4)
`;

      const values = [market, price, quantity, new Date(timestamp)];
      await pgClient.query(query, values);

      const tickerQuery = `
        INSERT INTO ticker (market, price, last_updated)
        VALUES ($1, $2, $3)
        ON CONFLICAT (market) DO UPDATE
        SET price = $2, last_updated = $3;
`;

      const tickerValues = [market, price, new Date(timestamp)];
      await pgClient.query(tickerQuery, tickerValues);
    }
    if (data.type === "ORDER_UPDATE") {
      const { orderId, executedQty, market, price, quantity, side } = data.data;
      const query = `
        INSERT INTO orders (order_id, market, price, quantity, executed_qty, side)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (order_id) DO UPDATE
        SET executed_qty = $5;
      `;
      const values = [orderId, market, price, quantity, executedQty, side];
      await pgClient.query(query, values);
    }
  }
}

main();
