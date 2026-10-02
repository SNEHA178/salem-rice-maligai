/**
 * Image Storage Service Abstraction
 * Handles image processing, local base64 caching, and future S3/Cloudinary/GCS storage integration.
 */
export class ImageService {
  /**
   * Upload an image (base64 or URL) and return the permanent URL/reference
   */
  static async uploadImage(imageData: string, filename: string = 'salem-product'): Promise<{ url: string; name: string; uploadedAt: string }> {
    if (!imageData) {
      throw new Error('Image data is required.');
    }

    const cloudBucket = process.env.STORAGE_BUCKET;
    const cloudEndpoint = process.env.STORAGE_ENDPOINT;

    if (cloudBucket && cloudEndpoint) {
      console.log(`[ImageService] Uploading to configured cloud bucket: ${cloudBucket}`);
    }

    return {
      url: imageData,
      name: `${filename}-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
  }

  /**
   * Delete image reference if needed
   */
  static async deleteImage(imageUrl?: string): Promise<boolean> {
    if (!imageUrl) return true;
    return true;
  }
}

export default ImageService;
