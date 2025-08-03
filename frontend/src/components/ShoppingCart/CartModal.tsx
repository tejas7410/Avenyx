// ********* Shopping cart operations here *********

import { X, Trash2 } from "lucide-react";
import { BasketResponse } from "../../types/cart";
import { useState } from "react";
import { CheckoutModal } from "../Checkout/CheckoutModal";
import { useCart } from "../../contexts/CartContext";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  basketData: BasketResponse | null;
}

export const CartModal = ({ isOpen, onClose, basketData }: CartModalProps) => {
  if (!isOpen) return null;
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { deleteFromCart, deleteAllFromCart } = useCart();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDelete = async (productId: string) => {
    setIsDeleting(productId);
    await deleteFromCart(productId);
    setIsDeleting(null);
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    await deleteAllFromCart();
    setIsDeletingAll(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {!basketData || basketData.basketItems.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4">
                {basketData.basketItems.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b pb-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting === item.id}
                            className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>${basketData.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeletingAll}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Delete All Items
                </button>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Checkout
                </button>
              </div>

              {isCheckoutOpen && (
                <CheckoutModal
                  isOpen={isCheckoutOpen}
                  onClose={() => setIsCheckoutOpen(false)}
                  basketData={basketData}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
