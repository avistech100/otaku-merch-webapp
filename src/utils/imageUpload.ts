import { supabase } from '../lib/supabase';

// Maximum file sizes
const MAX_AVATAR_SIZE = 1024 * 1024; // 1MB
const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed image formats
const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Validate image file format
 */
export const validateImageFormat = (file: File): boolean => {
  return ALLOWED_IMAGE_FORMATS.includes(file.type);
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

/**
 * Check if image is square (1:1 ratio)
 */
export const validateSquareRatio = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const isSquare = img.width === img.height;
      resolve(isSquare);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    
    img.src = url;
  });
};

/**
 * Resize image to target dimensions
 */
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          
          resolve(resizedFile);
        },
        file.type,
        0.9 // Quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Upload avatar image
 */
export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<string> => {
  // Validate format
  if (!validateImageFormat(file)) {
    throw new Error('Invalid image format. Please use JPG, PNG, or WebP.');
  }
  
  // Validate size
  if (!validateFileSize(file, MAX_AVATAR_SIZE)) {
    throw new Error('Image must be less than 1MB.');
  }
  
  // Resize to 256x256
  const resizedFile = await resizeImage(file, 256, 256);
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  
  // Create bucket if it doesn't exist
  const { data: buckets } = await supabase.storage.listBuckets();
  const avatarBucket = buckets?.find(b => b.name === 'avatars');
  
  if (!avatarBucket) {
    await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: MAX_AVATAR_SIZE,
      allowedMimeTypes: ALLOWED_IMAGE_FORMATS,
    });
  }
  
  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, resizedFile, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }
  
  // Get public URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Upload product image
 */
export const uploadProductImage = async (
  file: File,
  productId: string,
  index: number = 0
): Promise<string> => {
  // Validate format
  if (!validateImageFormat(file)) {
    throw new Error('Invalid image format. Please use JPG, PNG, or WebP.');
  }
  
  // Validate size
  if (!validateFileSize(file, MAX_PRODUCT_IMAGE_SIZE)) {
    throw new Error('Image must be less than 5MB.');
  }
  
  // Validate square ratio
  const isSquare = await validateSquareRatio(file);
  if (!isSquare) {
    throw new Error('Product images must be square (1:1 ratio).');
  }
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}-${index}-${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;
  
  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }
  
  // Get public URL
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Upload store logo
 */
export const uploadStoreLogo = async (
  file: File,
  creatorId: string
): Promise<string> => {
  // Validate format
  if (!validateImageFormat(file)) {
    throw new Error('Invalid image format. Please use JPG, PNG, or WebP.');
  }
  
  // Validate square ratio
  const isSquare = await validateSquareRatio(file);
  if (!isSquare) {
    throw new Error('Store logo must be square (1:1 ratio).');
  }
  
  // Resize to 512x512
  const resizedFile = await resizeImage(file, 512, 512);
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `logo-${creatorId}-${Date.now()}.${fileExt}`;
  const filePath = `store-assets/${fileName}`;
  
  // Create bucket if it doesn't exist
  const { data: buckets } = await supabase.storage.listBuckets();
  const storeBucket = buckets?.find(b => b.name === 'store-assets');
  
  if (!storeBucket) {
    await supabase.storage.createBucket('store-assets', {
      public: true,
      allowedMimeTypes: ALLOWED_IMAGE_FORMATS,
    });
  }
  
  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('store-assets')
    .upload(filePath, resizedFile, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }
  
  // Get public URL
  const { data } = supabase.storage
    .from('store-assets')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Upload store banner
 */
export const uploadStoreBanner = async (
  file: File,
  creatorId: string
): Promise<string> => {
  // Validate format
  if (!validateImageFormat(file)) {
    throw new Error('Invalid image format. Please use JPG, PNG, or WebP.');
  }
  
  // Resize to max 1920x400
  const resizedFile = await resizeImage(file, 1920, 400);
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `banner-${creatorId}-${Date.now()}.${fileExt}`;
  const filePath = `store-assets/${fileName}`;
  
  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('store-assets')
    .upload(filePath, resizedFile, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }
  
  // Get public URL
  const { data } = supabase.storage
    .from('store-assets')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Delete image from storage
 */
export const deleteImage = async (url: string): Promise<void> => {
  try {
    // Extract bucket name and file path from URL
    const urlParts = url.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) return;
    
    const [bucket, ...pathParts] = urlParts[1].split('/');
    const filePath = pathParts.join('/');
    
    await supabase.storage.from(bucket).remove([filePath]);
  } catch (error) {
    console.error('Failed to delete image:', error);
  }
};
