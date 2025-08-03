import { model, Schema } from "mongoose";

export interface Product {
    productId: string;
    name?: string; 
    quantity: number;
    price: number;
}

export interface Invoice {
    userId: string;
    products: Product[];
    totalPrice: number;
    isDeleted: boolean;
    deletedAt: Date | null;
}

const invoiceSchema = new Schema<Invoice>(
    {
        userId: { type: String, required: true },
        products: [
            {
                productId: { type: String, required: true },
                name: { type: String },
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

export const Invoice = model<Invoice>("Invoice",invoiceSchema);