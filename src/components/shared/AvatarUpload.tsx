import React, { useState, useRef } from 'react';
import { FaCamera, FaSpinner, FaTimes } from 'react-icons/fa';
import { uploadAvatar } from '../../utils/imageUpload';
import { useToast } from './Toast';

interface AvatarUploadProps {
    currentAvatarUrl: string | null;
    userId: string;
    onUploadComplete: (url: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
    currentAvatarUrl,
    userId,
    onUploadComplete,
}) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        setUploading(true);

        try {
            const url = await uploadAvatar(file, userId);
            onUploadComplete(url);
            showToast('success', 'Avatar uploaded successfully!');
            URL.revokeObjectURL(objectUrl);
        } catch (error: any) {
            showToast('error', error.message);
            setPreviewUrl(currentAvatarUrl); // Revert to original
        } finally {
            setUploading(false);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onUploadComplete('');
        showToast('info', 'Avatar removed');
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                {/* Avatar Display */}
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-bg-light shadow-xl relative">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent-crypto to-accent-anime flex items-center justify-center text-white text-4xl font-black">
                            {userId.slice(0, 2).toUpperCase()}
                        </div>
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-primary-black/70 flex items-center justify-center">
                            <FaSpinner className="animate-spin text-white text-2xl" />
                        </div>
                    )}
                </div>

                {/* Upload Overlay */}
                <button
                    onClick={handleClick}
                    disabled={uploading}
                    className="absolute inset-0 bg-primary-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                >
                    <FaCamera className="text-white text-2xl" />
                </button>

                {/* Remove Button */}
                {previewUrl && !uploading && (
                    <button
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
                    >
                        <FaTimes size={14} />
                    </button>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Upload Instructions */}
            <div className="text-center">
                <button
                    onClick={handleClick}
                    disabled={uploading}
                    className="text-accent-crypto font-bold text-sm uppercase tracking-widest hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? 'Uploading...' : previewUrl ? 'Change Avatar' : 'Upload Avatar'}
                </button>
                <p className="text-[10px] text-primary-dark-gray/40 font-medium mt-1">
                    JPG, PNG, or WebP. Max 1MB. Will be resized to 256x256.
                </p>
            </div>
        </div>
    );
};

export default AvatarUpload;
