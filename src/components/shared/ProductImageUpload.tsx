import React, { useState, useRef } from 'react';
import { FaImage, FaSpinner, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { uploadProductImage, validateSquareRatio, validateImageFormat, validateFileSize } from '../../utils/imageUpload';
import { useToast } from './Toast';

interface ProductImageUploadProps {
    productId: string;
    existingImages?: string[];
    onImagesChange: (urls: string[]) => void;
    maxImages?: number;
}

interface ImageUploadState {
    url: string;
    preview: string;
    uploading: boolean;
    error: string | null;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
    productId,
    existingImages = [],
    onImagesChange,
    maxImages = 5,
}) => {
    const [images, setImages] = useState<ImageUploadState[]>(
        existingImages.map(url => ({ url, preview: url, uploading: false, error: null }))
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length + images.length > maxImages) {
            showToast('error', `Maximum ${maxImages} images allowed`);
            return;
        }

        for (const file of files) {
            // Validate format
            if (!validateImageFormat(file)) {
                showToast('error', `${file.name}: Invalid format. Use JPG, PNG, or WebP`);
                continue;
            }

            // Validate size (5MB)
            if (!validateFileSize(file, 5 * 1024 * 1024)) {
                showToast('error', `${file.name}: File too large. Max 5MB`);
                continue;
            }

            // Check square ratio
            const isSquare = await validateSquareRatio(file);
            if (!isSquare) {
                showToast('error', `${file.name}: Image must be square (1:1 ratio)`);
                continue;
            }

            // Create preview
            const preview = URL.createObjectURL(file);
            const newImage: ImageUploadState = {
                url: '',
                preview,
                uploading: true,
                error: null,
            };

            setImages(prev => [...prev, newImage]);

            // Upload
            try {
                const url = await uploadProductImage(file, productId, images.length);

                setImages(prev => prev.map(img =>
                    img.preview === preview
                        ? { ...img, url, uploading: false }
                        : img
                ));

                // Update parent
                const updatedUrls = [...images.map(img => img.url), url].filter(Boolean);
                onImagesChange(updatedUrls);

                showToast('success', 'Image uploaded successfully!');
            } catch (error: any) {
                setImages(prev => prev.map(img =>
                    img.preview === preview
                        ? { ...img, uploading: false, error: error.message }
                        : img
                ));
                showToast('error', error.message);
            } finally {
                URL.revokeObjectURL(preview);
            }
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemove = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onImagesChange(newImages.map(img => img.url).filter(Boolean));
        showToast('info', 'Image removed');
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="relative aspect-square rounded-2xl overflow-hidden border-2 border-bg-light bg-bg-light group"
                    >
                        <img
                            src={image.preview}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                        />

                        {/* Uploading Overlay */}
                        {image.uploading && (
                            <div className="absolute inset-0 bg-primary-black/70 flex flex-col items-center justify-center">
                                <FaSpinner className="animate-spin text-white text-2xl mb-2" />
                                <p className="text-white text-xs font-bold">Uploading...</p>
                            </div>
                        )}

                        {/* Error Overlay */}
                        {image.error && (
                            <div className="absolute inset-0 bg-red-500/70 flex flex-col items-center justify-center p-2">
                                <FaExclamationTriangle className="text-white text-xl mb-2" />
                                <p className="text-white text-[10px] font-bold text-center">
                                    {image.error}
                                </p>
                            </div>
                        )}

                        {/* Success Indicator */}
                        {image.url && !image.uploading && !image.error && (
                            <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <FaCheckCircle className="text-white text-sm" />
                            </div>
                        )}

                        {/* Remove Button */}
                        {!image.uploading && (
                            <button
                                onClick={() => handleRemove(index)}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                            >
                                <FaTimes size={14} />
                            </button>
                        )}

                        {/* Index Badge */}
                        <div className="absolute bottom-2 left-2 bg-primary-black/70 text-white text-xs font-black px-2 py-1 rounded-lg">
                            #{index + 1}
                        </div>
                    </div>
                ))}

                {/* Add More Button */}
                {images.length < maxImages && (
                    <button
                        onClick={handleClick}
                        className="aspect-square rounded-2xl border-2 border-dashed border-primary-dark-gray/30 hover:border-accent-crypto hover:bg-accent-crypto/5 transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                        <FaImage className="text-primary-dark-gray/30 text-3xl group-hover:text-accent-crypto transition-colors" />
                        <span className="text-xs font-black uppercase tracking-widest text-primary-dark-gray/40 group-hover:text-accent-crypto transition-colors">
                            Add Image
                        </span>
                    </button>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                multiple
                className="hidden"
            />

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm font-bold text-blue-600 mb-2 flex items-center gap-2">
                    <FaImage /> Image Requirements
                </p>
                <ul className="text-xs text-primary-dark-gray space-y-1 list-disc list-inside">
                    <li className="font-bold">Images must be <span className="text-accent-crypto">square (1:1 ratio)</span></li>
                    <li>Formats: JPG, PNG, or WebP</li>
                    <li>Max file size: 5MB per image</li>
                    <li>Maximum {maxImages} images total</li>
                    <li>First image will be the main product photo</li>
                </ul>
            </div>
        </div>
    );
};

export default ProductImageUpload;
