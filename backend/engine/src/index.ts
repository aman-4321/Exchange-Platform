import { createClient } from "redis";
import { Engine } from "./trade/Engine";

async function main() {
  const engine = new Engine();
  const redisClient = createClient();
  await redisClient.connect();
  console.log("connected to redis");

  while (true) {
    const respone = await redisClient.rPop("messages" as string);
    if (!respone) {
    } else {
      engine.process(JSON.parse(respone));
    }
  }
}

main();
