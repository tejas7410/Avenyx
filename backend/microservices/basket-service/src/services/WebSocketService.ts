// ********** WebSocket Service ( socket.io ) Settings *************

import { injectable } from "inversify";
import { Server, Socket } from "socket.io";
import { IWebSocketService } from "./IWebSocketService";
import { logger } from "../../config/logger";

@injectable()
export class WebSocketService implements IWebSocketService {
  private io: Server;
  private rooms: Map<string, Set<string>> = new Map();

  constructor() {
    this.io = null!;
  }

  // -> Initialize the WebSocket server
  initialize(server: any): void {
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      transports: ["websocket", "polling"],
    });

    // -> With connection
    this.io.on("connection", (socket: Socket) => {
      
      logger.info("New WebSocket client connected", socket.id);

      // -> Handle joining product rooms
      socket.on("joinRoom", (productId: string) => {
        if (!productId) {
          logger.error(`Invalid productId: ${productId}`);
          return;
        }

        const room = `product-${productId}`;
        socket.join(room);

       // -> Track room membership here like [One socket client, other ...socket clients]
       if (!this.rooms.has(room)) {
        this.rooms.set(room, new Set());
      }
      this.rooms.get(room)?.add(socket.id);
      
      // console.log(`Client ${socket.id} joined room ${room}`);
      // console.log(`Current room members:`, Array.from(this.rooms.get(room) || []));
    });

    // -> Handle leaving room
    socket.on("leaveRoom", (productId: string) => {
      if (!productId) return;

      const room = `product-${productId}`;
      socket.leave(room);
      
      // -> Update room membership
      this.rooms.get(room)?.delete(socket.id);
      if (this.rooms.get(room)?.size === 0) {
        this.rooms.delete(room);
      }
      
      // console.log(`Client ${socket.id} left room ${room}`);
    });

    socket.on("disconnect", () => {
      // -> Clean up room all membership on disconnect
      this.rooms.forEach((members, room) => {
        if (members.has(socket.id)) {
          members.delete(socket.id);
          if (members.size === 0) {
            this.rooms.delete(room);
          }
        }
      });
      // console.log("Client disconnected:", socket.id);
    });
  });
}

  // -> Broadcast basket update
  broadcastBasketUpdate(userId: string, updateData: any): void {
    if (!userId || !updateData.productId) {
      logger.error("Cannot broadcast basket update: missing required data");
      return;
    }

    const room = `product-${updateData.productId}`;
    // console.log(`Broadcasting to room ${room}:`, { userId, updateData });
    // console.log(`Active members in room:`, Array.from(this.rooms.get(room) || []));

    // -> Only broadcast if there are clients in the room
    if (this.rooms.get(room)?.size) {
      this.io.to(room).emit("basket-update", {
        userId,
        updateData: {
          ...updateData,
          action: 'add', 
          timestamp: Date.now()
        }
      });
    } else {
      logger.info(`No clients in room ${room}, no broadcast`);
    }
  }
}
