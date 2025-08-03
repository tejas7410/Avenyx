import { Document, ObjectId, Schema, model } from "mongoose";

// -> This is the interface for the Product Schema in MongoDB
export interface Product extends Document {
  _id: ObjectId;
  name: string;
  category: string;
  description: string;
  image: {
    public_id:string,
    url:String
  };
  price: number;
  stock: number;
  isDeleted: boolean; // Soft delete logic
  deletedAt: Date | null; // Timestamp for soft delete
}

// -> I used static categories in my scenario for now
const staticCategories = [
  "Monitor",
  "Keyboard",
  "Mouse",
  "RAM",
  "Graphic Card",
  "Motherboard",
  "Processor",
];

const productSchema = new Schema<Product>(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: staticCategories,
      message: "Category must be one of: " + staticCategories.join(", "),
    },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    image: {
      public_id: { type: String, required: true },
      url: { type: String, required: true }, 
    },
    isDeleted: { type: Boolean, required: true, default: false }, // Manage soft delete
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export const Product = model<Product>("Product", productSchema);
