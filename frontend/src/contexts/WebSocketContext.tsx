import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const WebSocketContext = createContext<Socket | null>(null);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  // -> With page loading websocket connection will be established with codes below
  useEffect(() => {

    // -> Connecting to WebSocket server I created in Basket Microservice in backend
    const newSocket = io("http://localhost:3001");

    newSocket.on("connect", () => {
      // console.log("WebSocket connected:", newSocket.id);
      setLoading(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket connection failed:", error); 
    });

    // -> Setting newsocket as useState above
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  if (loading) {
    return <LoadingSpinner/>;
  }

  // -> App.tsx will be wrapped with WebSocketProvider (ProductCard as chilndren)
  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

// -> Exporting for using at /contexts/CartContext.tsx for now
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === null) {
    throw new Error("[useWebSocket - WebSocketContext] context null");
  }
  return context;
};
