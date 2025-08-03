// ************* This context for managing my shopping card operations logic *************

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useWebSocket } from "./WebSocketContext";
import { BasketItem, BasketResponse } from "../types/cart";

// -> Interfaces
interface CartContextType {
  basketItems: BasketItem[];
  addToCart: (productId: string, quantity: number) => void;
  deleteFromCart: (productId: string) => Promise<void>;
  deleteAllFromCart: () => Promise<void>;
  getTotalItems: () => number;
  fetchBasket: () => void;
  basketData: BasketResponse | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // -> Getting userId from AuthContext and socket from WebSocketContext
  const { userId } = useAuth();
  const socket = useWebSocket();

  // -> Shopping cart items on navbar ( get from localstorage )

  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [basketData, setBasketData] = useState(null);

  // -> Fetching user basket datas
  const fetchBasket = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:3001/basket/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch basket");
      const data = await response.json();
      setBasketData(data);
      setBasketItems(data.basketItems || []);
    } catch (error) {
      console.error("Error fetching basket:", error);
    }
  };

  // ******* Websocket actions (in my scenario when any user clicked add to cart other user will see '..count user added this product to card..')
  // -> If user logged in socket will be listening for basket-update
  useEffect(() => {
    if (userId && socket) {
      socket.on("basket-update", (data: any) => {
        if (data.userId === userId) {
          setBasketItems(data.updateData.basket || []);
        }
      });
      return () => {
        socket.off("basket-update");
      };
    }
  }, [socket, userId]);

  // -> With click add to cart operations
  const addToCart = async (productId: string, quantity: number) => {
    try {
      const response = await fetch("http://localhost:3001/basket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, quantity, action: "add" }),
      });
      if (!response.ok) throw new Error("Failed to add to cart");
      fetchBasket(); // ->Refresh basket after adding item.
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const deleteFromCart = async (productId: string) => {
    try {
      const response = await fetch("http://localhost:3001/basket/delete/item", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete from cart");

      fetchBasket(); // Refresh basket after deletion
    } catch (error) {
      console.error("Error deleting from cart:", error);
    }
  };

  const deleteAllFromCart = async () => {
    try {
      const response = await fetch(`http://localhost:3001/basket/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete all items");
      fetchBasket();
    } catch (error) {
      console.error("Error deleting all items:", error);
    }
  };

  const getTotalItems = () => {
    if (!Array.isArray(basketItems)) return 0;
    return basketItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        basketItems,
        addToCart,
        deleteFromCart,
        deleteAllFromCart,
        getTotalItems,
        fetchBasket,
        basketData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
