import { ServiceMessage } from "../types/ServiceMessage"

export interface IWebSocketService {
    initialize(server: any): void;
    broadcastBasketUpdate(userId: string, updateData: any): void;
  }