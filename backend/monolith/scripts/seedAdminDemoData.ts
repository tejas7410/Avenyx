import "reflect-metadata";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Redis from "ioredis";
import dotenv from "dotenv";
import { User } from "../identity-service/src/models/UserModel";
import { Product } from "../product-service/src/models/ProductModel";

dotenv.config();

const categories = [
  "Monitor",
  "Keyboard",
  "Mouse",
  "RAM",
  "Graphic Card",
  "Motherboard",
  "Processor",
];

const categoryPriceRanges: Record<string, [number, number]> = {
  Monitor: [149, 899],
  Keyboard: [39, 249],
  Mouse: [19, 159],
  RAM: [45, 320],
  "Graphic Card": [229, 1899],
  Motherboard: [89, 499],
  Processor: [129, 799],
};

function priceFor(category: string, sellerIndex: number, productIndex: number) {
  const [min, max] = categoryPriceRanges[category];
  const spread = max - min;
  const factor = ((sellerIndex * 17 + productIndex * 11) % 100) / 100;
  return Math.round(min + spread * factor);
}

async function clearProductCache() {
  const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  });

  try {
    const keys = await redis.keys("product:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } finally {
    await redis.quit();
  }
}

async function main() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/avenyx";
  const baseUrl = process.env.MONOLITH_PUBLIC_URL || "http://localhost:3000";
  const imageDir = path.join(process.cwd(), "public", "images");
  const imageFiles = fs
    .readdirSync(imageDir)
    .filter((file) => /\.(jpg|jpeg|png|webp|svg)$/i.test(file));

  if (imageFiles.length === 0) {
    throw new Error(`No seed images found in ${imageDir}`);
  }

  await mongoose.connect(mongoUri);

  await Product.deleteMany({ name: /^Demo / });
  await User.deleteMany({ email: /@avenyx-demo\.local$/ });

  const passwordHash = await bcrypt.hash("Seller123!", 10);
  const adminHash = await bcrypt.hash("Admin123!", 10);

  await User.create({
    name: "Avenyx",
    surname: "Admin",
    email: "admin@avenyx-demo.local",
    password: adminHash,
    role: "admin",
    isDeleted: false,
    deletedAt: null,
    isAvailable: true,
  });

  const sellers = await User.insertMany(
    Array.from({ length: 15 }, (_, index) => ({
      name: `Demo Seller ${index + 1}`,
      surname: "Account",
      email: `seller${index + 1}@avenyx-demo.local`,
      password: passwordHash,
      role: "seller",
      isDeleted: false,
      deletedAt: null,
      isAvailable: true,
    }))
  );

  const products = sellers.flatMap((seller, sellerIndex) =>
    categories.flatMap((category) =>
      Array.from({ length: 5 }, (_, productIndex) => {
        const imageFile =
          imageFiles[(sellerIndex * categories.length + productIndex) % imageFiles.length];
        const sequence = productIndex + 1;

        return {
          sellerId: seller._id.toString(),
          name: `Demo ${category} ${sellerIndex + 1}-${sequence}`,
          category,
          description: `${category} option from Demo Seller ${sellerIndex + 1}, configured for admin analytics and storefront browsing.`,
          image: {
            public_id: imageFile,
            url: `${baseUrl}/uploads/${imageFile}`,
          },
          price: priceFor(category, sellerIndex + 1, sequence),
          stock: 8 + ((sellerIndex + productIndex) % 24),
          isDeleted: false,
          deletedAt: null,
        };
      })
    )
  );

  await Product.insertMany(products);
  await clearProductCache();

  console.log(
    `Seed complete: 1 admin, ${sellers.length} sellers, ${products.length} products.`
  );
  console.log("Admin login: admin@avenyx-demo.local / Admin123!");
  console.log("Seller login pattern: seller1@avenyx-demo.local / Seller123!");

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
