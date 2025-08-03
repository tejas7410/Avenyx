import { model, Schema } from "mongoose";

export interface Product {
    productId: string;
    productName: string; 
    quantity: number;
    price: number;
}

export interface Order {
    userId: string;
    paymentId: string;
    products: Product[];
    totalPrice: number;
    isDeleted: boolean;
    deletedAt: Date | null;
}

const orderSchema = new Schema<Order>(
    {
        paymentId: { type: String, required: true },
        userId: { type: String, required: true },
        products: [
            {
                productId: { type: String, required: true },
                productName: { type: String },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                 
            },
        ],
        totalPrice: { type: Number, required: true },
        isDeleted: { type: Boolean, required: true, default: false }, // Manage soft delete
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export const Order = model<Order>("Order",orderSchema);