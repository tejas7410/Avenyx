// ************* Managing Invoices Page at 'My Account' Here *************

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { format } from 'date-fns';
import { Download, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from "react";

interface Product {
  name: string;
  quantity: number;
  price: number;
}

interface Invoice {
  _id: string;
  products: Product[];
  totalPrice: number;
  createdAt: string;
}

// -> For managing ux there is no invoice situtation
const EmptyInvoices = () => (
  <div className="text-center py-12">
    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No invoices found
    </h3>
    <p className="text-gray-500 mb-6">
      No invoices available yet. Complete an order to generate invoices.
    </p>
    <Button>
      Start Shopping
    </Button>
  </div>
);

export const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:3004/api/v1/invoice/${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }

        const { data } = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setError('Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchInvoices();
    }
  }, [userId]);


  const handleDownload = (invoiceNo: string) => {

    // -> Implement invoice download logic, for now its just icon and console 
    console.log(`Downloading invoice ${invoiceNo}`);

  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">My Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>
                Sorry, we encountered an error while fetching your invoices. Please try again later.
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="text-center py-4">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <EmptyInvoices />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Total Price</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-medium">{invoice._id}</TableCell>
                    <TableCell>
                      <div className="max-h-32 overflow-y-auto">
                        {invoice.products.map((product, index) => (
                          <div key={index} className="text-sm">
                            {product.name} x{product.quantity} - ${product.price.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${invoice.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(invoice._id)}
                        className="hover:bg-gray-100"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
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