// ************* Managing Orders Page at 'My Account' Here *************

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Product {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  products: Product[];
  totalPrice: number;
  createdAt: string;
}

// -> For managing ux there is no order situtation
const EmptyOrders = () => (
  <div className="text-center py-12">
    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
    <p className="text-gray-500 mb-6">
      You haven't placed any orders yet. Start shopping to see your orders here!
    </p>
    <Button>Start Shopping</Button>
  </div>
);

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:3003/api/v1/order/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const { data } = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">My Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>
                Sorry, we encountered an error while fetching your orders.
                Please try again later.
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="text-center py-4">Loading orders...</div>
          ) : orders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order No</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Total Price</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{order._id}</TableCell>
                    <TableCell>
                      <div className="max-h-32 overflow-y-auto">
                        {order.products.map((product, index) => (
                          <div key={index} className="text-sm">
                            {product.productName} x{product.quantity} - $
                            {product.price.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${order.totalPrice.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
