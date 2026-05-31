// ********* Product Card Setups with also websocket integrations on add to cart right up of card real-time notif *********
import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../contexts/CartContext";
import { useWebSocket } from "../../../contexts/WebSocketContext";
import { Product } from "../../../types/main";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product }, ref) => {
    const { addToCart } = useCart();
    const { userId, isBuyer, isAuthenticated, isSeller } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [cartCount, setCartCount] = useState(0);
    const socket = useWebSocket();

    const handleBasketUpdate = useCallback(
      (data: any) => {
        const isDifferentUser = data.userId !== userId;
        const isCorrectProduct = data.updateData.productId === product._id;
        const isAddAction = data.updateData.action === "add";

        if (isDifferentUser && isCorrectProduct && isAddAction) {
          setCartCount((prev) => prev + 1);
          setTimeout(() => {
            setCartCount((prev) => Math.max(0, prev - 1));
          }, 15000);
        }
      },
      [userId, product._id]
    );

    useEffect(() => {
      if (socket && product._id) {
        socket.emit("joinRoom", product._id);

        const handleUpdate = (data: any) => {
          handleBasketUpdate(data);
        };

        socket.on("basket-update", handleUpdate);

        return () => {
          socket.off("basket-update", handleUpdate);
          socket.emit("leaveRoom", product._id);
        };
      }
    }, [socket, product._id, handleBasketUpdate]);

    const handleAddToCart = () => {
      addToCart(product._id as string, quantity);
    };

    return (
      <div
        ref={ref}
        className="relative flex flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-lg shadow-black/20 transition-all duration-300 hover:border-slate-700 hover:shadow-xl"
      >
        {cartCount > 0 && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse z-10">
            {cartCount} users added this
          </div>
        )}
    
        <div className="relative group px-4 pt-8">
          <div className="aspect-w-4 aspect-h-3 overflow-hidden rounded-lg bg-slate-950">
            <img
              src={product.image.url}
              alt={product.name}
              className="w-4/5 h-48 object-contain mx-auto transform group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg";
              }}
            />
          </div>
          <div className="absolute inset-0 bg-white bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-5" />
        </div>
    
        {/* Fixed height container for consistent alignment */}
        <div className="p-6 flex flex-col flex-grow">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-cyan-400">
              {product.category}
            </p>
          <h3 className="mb-2 line-clamp-1 text-xl font-semibold text-white">
            {product.name}
          </h3>
          <p className="mb-4 line-clamp-2 flex-grow text-sm text-slate-400">
            {product.description}
          </p>
    
          <div className="flex flex-col space-y-4 mt-auto">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-slate-100">
                ${product.price}
              </span>
              {isBuyer && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-slate-700 bg-slate-950">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="rounded-l-lg p-2 transition-colors hover:bg-slate-800"
                    >
                      <Minus className="h-4 w-4 text-slate-300" />
                    </button>
                    <span className="px-4 py-2 font-medium text-slate-200">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="rounded-r-lg p-2 transition-colors hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4 text-slate-300" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isBuyer && (
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-3 font-medium text-slate-950 transition-all duration-300 hover:bg-cyan-400"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
            )}

            {!isAuthenticated && (
              <p className="py-2 text-center text-sm text-slate-500">
                Sign in as a buyer to purchase this item
              </p>
            )}

            {isSeller && (
              <p className="py-2 text-center text-sm text-slate-500">
                Visible to all buyers on the marketplace
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";
