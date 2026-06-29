import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 image to Cloudinary.
 * If Cloudinary credentials are not set, it falls back to storing the base64 string directly in the database.
 * If the input is already a URL, it returns it as is.
 */
export async function uploadImage(base64Data: string): Promise<string> {
  if (!base64Data) {
    return "";
  }

  // If it's already an uploaded URL, return it
  if (base64Data.startsWith("http://") || base64Data.startsWith("https://")) {
    return base64Data;
  }

  // Check if credentials are set
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.warn("Cloudinary credentials not configured in environment. Storing as Base64 in database.");
    return base64Data;
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder: "enjaz_members",
      resource_type: "image",
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed, falling back to Base64:", error);
    return base64Data;
  }
}
