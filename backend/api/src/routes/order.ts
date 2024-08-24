import { Request, Response, Router } from "express";
import { RedisManager } from "../RedisManager";
import { CANCEL_ORDER, CREATE_ORDER, GET_OPEN_ORDERS } from "../types";

export const orderRouter = Router();

orderRouter.post("/", async (req: Request, res: Response) => {
  const { market, price, quantity, side, userId } = req.body;
  console.log({ market, price, quantity, side, userId });
  //TODO: make the type of the response object right? Right now it is a union.
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
});

orderRouter.delete("/", async (req: Request, res: Response) => {
  const { orderId, market } = req.body;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: CANCEL_ORDER,
    data: {
      orderId,
      market,
    },
  });
  res.json(response.payload);
});

orderRouter.get("/open", async (req: Request, res: Response) => {
  const response = await RedisManager.getInstance().sendAndAwait({
    type: GET_OPEN_ORDERS,
    data: {
      userId: req.query.userId as string,
      market: req.query.userId as string,
    },
  });
  res.json(response.payload);
});
