import { WebSocket } from "ws";
import { OutgoingMessage } from "./types/out";
import { IncomingMessage, SUBSCRIBE, UNSUBSCRIBE } from "./types/in";
import { SubscriptionManager } from "./SubscriptionManager";

export class User {
  private id: string;
  private ws: WebSocket;

  constructor(id: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;
    this.addListeners();
  }

  private subscriptions: string[] = [];

  public subscribe(subscription: string) {
    if (!this.subscriptions.includes(subscription)) {
      this.subscriptions.push(subscription);
      SubscriptionManager.getInstance().subscribe(this.id, subscription);
    }
  }

  public unsubscribe(subscription: string) {
    this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
    SubscriptionManager.getInstance().unsubscribe(this.id, subscription);
  }

  emit(message: OutgoingMessage) {
    this.ws.send(JSON.stringify(message));
  }

  private addListeners() {
    this.ws.on("message", (message: string) => {
      const parsedMessage: IncomingMessage = JSON.parse(message);
      if (parsedMessage.method === SUBSCRIBE) {
        parsedMessage.params.forEach((s) => this.subscribe(s));
      }

      if (parsedMessage.method === UNSUBSCRIBE) {
        parsedMessage.params.forEach((s) => this.unsubscribe(s));
      }
    });
  }
}
