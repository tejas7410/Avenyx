import { Schema, model, Types } from "mongoose";

// -> This is interface of User Schema in mongo
export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  surname: string;
  email: string;
  password: string;
  role:string;
  isAvailable:boolean;
  isDeleted: boolean; // -> I will manage my soft delete logic with that
  deletedAt: Date | null; // -> Timestamp for soft delete
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["seller", "buyer", "admin"], default: "buyer" },
    isAvailable: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
