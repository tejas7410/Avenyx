import fs from "fs";
import path from "path";
import cloudinary from "../../../config/cloudinary";

const UPLOAD_DIR = path.join(process.cwd(), "public", "images");

export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadProductImage(
  imagePath: string
): Promise<{ public_id: string; url: string }> {
  if (!imagePath) {
    throw new Error("Product image is required");
  }

  if (isCloudinaryConfigured()) {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "products",
    });
    return { public_id: result.public_id, url: result.secure_url };
  }

  const filename = path.basename(imagePath);
  const baseUrl =
    process.env.MONOLITH_PUBLIC_URL || "http://localhost:3000";

  return {
    public_id: filename,
    url: `${baseUrl}/uploads/${filename}`,
  };
}
