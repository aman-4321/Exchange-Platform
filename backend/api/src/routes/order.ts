import { Request, Response, Router } from "express";
import { RedisManager } from "../RedisManager";
import { CANCEL_ORDER, CREATE_ORDER, GET_OPEN_ORDERS } from "../types";

export const orderRouter = Router();

orderRouter.post("/", async (req: Request, res: Response) => {
  const { market, price, quantity, side, userId } = req.body;
  console.log({ market, price, quantity, side, userId });
  try {
    const response = await RedisManager.getInstance().sendAndAwait({
      type: CREATE_ORDER,
      data: {
        market,
        price,
        quantity,
        side,
        userId,
      },
    });
    res.json(response.payload);
  } catch (e) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the order" });
  }
});

orderRouter.delete("/", async (req: Request, res: Response) => {
  const { orderId, market } = req.body;

  try {
    const response = await RedisManager.getInstance().sendAndAwait({
      type: CANCEL_ORDER,
      data: {
        orderId,
        market,
      },
    });
    res.json(response.payload);
  } catch (e) {
    res
      .status(500)
      .json({ error: "An error occurred while canceling the order" });
  }
});

orderRouter.get("/open", async (req: Request, res: Response) => {
  try {
    const response = await RedisManager.getInstance().sendAndAwait({
      type: GET_OPEN_ORDERS,
      data: {
        userId: req.query.userId as string,
        market: req.query.userId as string,
      },
    });
    res.json(response.payload);
  } catch (e) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching open orders" });
  }
});
