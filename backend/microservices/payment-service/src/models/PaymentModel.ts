import { model, Schema } from "mongoose";

export interface Payment {
    userId: string;
    paymentMethod:string;
    totalAmount: number;
}

const paymentSchema=new Schema<Payment>({

    userId: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    }
},
{ timestamps: true }); // Automatically adds createdAt and updatedAt fields)


export const Payment = model<Payment>("Payment", paymentSchema);