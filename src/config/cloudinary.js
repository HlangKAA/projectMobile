// Cloudinary upload helper using unsigned upload preset
const CLOUD_NAME = "domdgprnz"; // TODO: Replace with your actual cloud name
const UPLOAD_PRESET = "dmrkefh7"; // TODO: Replace with your actual upload preset

/**
 * Uploads an image to Cloudinary and returns the secure URL.
 * @param {string} imageUri - Local URI of the image (from expo-image-picker)
 * @returns {Promise<string>} - The secure Cloudinary URL
 */
export const uploadImageToCloudinary = async (imageUri) => {
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "upload.jpg",
  });
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Cloudinary upload failed");
  }

  const data = await response.json();
  return data.secure_url;
};
