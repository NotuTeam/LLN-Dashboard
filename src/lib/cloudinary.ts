/** @format */

const CLOUDINARY_CLOUD_NAME = "dgd3iusxa";
const CLOUDINARY_UPLOAD_PRESET = "excelearn_unsigned";

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
}

export async function uploadToCloudinary(
  file: File,
  folder: string = "assets"
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const resourceType = file.type.startsWith("video/") ? "video" : "image";

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Upload failed");
  }

  return response.json();
}
