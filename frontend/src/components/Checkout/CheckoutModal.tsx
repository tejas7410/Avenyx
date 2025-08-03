// ********* With click checkout modal operations here *********

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { BasketResponse } from "../../types/cart";
import { toast } from 'react-toastify';
import { X } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  basketData: BasketResponse | null;
}

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cardholderName: string;
  cardholderSurname: string;
}

export const CheckoutModal = ({
  isOpen,
  onClose,
  basketData,
}: CheckoutModalProps) => {
  const { userId } = useAuth();
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: "",
    expiryDate: "",
    cardholderName: "",
    cardholderSurname: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // -> Format card number with spaces regex here
    if (name === "cardNumber") {
      const formatted = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
      setPaymentData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    // -> Format expiry date regex here
    if (name === "expiryDate") {
      const formatted = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .substr(0, 5);
      setPaymentData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      
      const orderData = {
        userId,
        products: basketData?.basketItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        cardNo: paymentData.cardNumber.replace(/\s/g, ""),
        totalAmount: basketData?.totalPrice,
      };

      // -> Send payment and order data to the payment service, if payment is ok service will produce event to the order and invoice service
      const response = await fetch("http://localhost:3002/api/v1/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to process payment");
      }

      toast.success("Payment processed successfully!");

      onClose();
    
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Checkout</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex">
            
            <div className="w-1/2 p-6 border-r">
              <h3 className="text-lg font-medium mb-4">Payment Information</h3>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    maxLength={19}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="0000 0000 0000 0000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handleInputChange}
                    maxLength={5}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="MM/YY"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="cardholderName"
                    value={paymentData.cardholderName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Surname
                  </label>
                  <input
                    type="text"
                    name="cardholderSurname"
                    value={paymentData.cardholderSurname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>
            </div>

            
            <div className="w-1/2 p-6">
              <h3 className="text-lg font-medium mb-4">Order Summary</h3>

              <div className="space-y-4">
                {basketData?.basketItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </span>
                        <span className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>${basketData?.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Processing..." : "Complete Purchase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
