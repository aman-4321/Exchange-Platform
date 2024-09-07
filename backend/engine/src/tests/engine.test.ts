import { describe, expect, it, vi } from "vitest";
import { Engine } from "../trade/Engine";
import { CREATE_ORDER } from "../types/fromApi";

vi.mock("../RedisManager", () => {
  const publishMessage = vi.fn();
  const sendToApi = vi.fn();
  const pushMessage = vi.fn();
  return {
    RedisManager: {
      getInstance: () => ({
        publishMessage,
        sendToApi,
        pushMessage,
      }),
    },
  };
});

describe("Engine", () => {
  it("Publishes Trade updates", () => {
    const engine = new Engine();
    const publishSpy = vi.spyOn(engine, "publishWsTrades");

    engine.process({
      message: {
        type: CREATE_ORDER,
        data: {
          market: "TATA_INR",
          price: "1000",
          quantity: "1",
          side: "buy",
          userId: "1",
        },
      },
      clientId: "1",
    });

    engine.process({
      message: {
        type: CREATE_ORDER,
        data: {
          market: "TATA_INR",
          price: "1001",
          quantity: "1",
          side: "sell",
          userId: "2",
        },
      },
      clientId: "1",
    });

    expect(publishSpy).toHaveBeenCalledTimes(2);
  });
});
