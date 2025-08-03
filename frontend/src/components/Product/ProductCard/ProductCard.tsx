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
    const { userId } = useAuth();
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
        className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
      >
        {cartCount > 0 && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse z-10">
            {cartCount} users added this
          </div>
        )}
    
        <div className="relative group px-4 pt-8">
          <div className="aspect-w-4 aspect-h-3 overflow-hidden rounded-lg">
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
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300" />
        </div>
    
        {/* Fixed height container for consistent alignment */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-gray-600 line-clamp-2 mb-4 text-sm flex-grow">
            {product.description}
          </p>
    
          <div className="flex flex-col space-y-4 mt-auto">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-800">
                ${product.price}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="px-4 py-2 font-medium text-gray-700">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
    
            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";
