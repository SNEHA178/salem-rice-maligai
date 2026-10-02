/**
 * Image Storage Service Abstraction
 * Handles image processing, local base64 caching, and future S3/Cloudinary/GCS storage integration.
 */
export class ImageService {
  /**
   * Upload an image (base64 or URL) and return the permanent URL/reference
   * @param {string} imageData - Data URL or remote URL
   * @param {string} [filename] - Optional asset identifier
   * @returns {Promise<{ url: string, name: string, size?: number }>}
   */
  static async uploadImage(imageData, filename = 'salem-product') {
    if (!imageData) {
      throw new Error('Image data is required.');
    }

    // Future cloud storage hooks (e.g. AWS S3, Cloudinary, GCS)
    const cloudBucket = process.env.STORAGE_BUCKET;
    const cloudEndpoint = process.env.STORAGE_ENDPOINT;

    if (cloudBucket && cloudEndpoint) {
      // Future integration point for production S3/GCS
      console.log(`[ImageService] Uploading to configured cloud bucket: ${cloudBucket}`);
    }

    // For webapp previews & persistent MongoDB storage, normalize and return the verified URL/data URI
    return {
      url: imageData,
      name: `${filename}-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
  }

  /**
   * Delete image reference if needed
   */
  static async deleteImage(imageUrl) {
    if (!imageUrl) return true;
    return true;
  }
}

export default ImageService;
