import { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary';
import { success, error } from '../utils/response';
import streamifier from 'streamifier';

/**
 * Upload image to Cloudinary
 */
export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json(error('No file uploaded', 'Please select an image file'));
    }

    // Get folder from query params (trainers or testimonials)
    const folder = req.query.folder as string || 'general';

    // Upload to Cloudinary using stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ironpulse/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (err, result) => {
        if (err) {
          return res.status(500).json(error('Upload failed', err.message));
        }

        if (result) {
          return res.status(200).json(success('Image uploaded successfully', {
            url: result.secure_url,
            publicId: result.public_id,
          }));
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json(error('Public ID required', 'Please provide the image public ID'));
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return res.status(200).json(success('Image deleted successfully', result));
    } else {
      return res.status(400).json(error('Delete failed', 'Could not delete the image'));
    }
  } catch (err) {
    next(err);
  }
};
