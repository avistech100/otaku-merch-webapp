import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaTimes, FaImage } from 'react-icons/fa';

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number; // in bytes
    acceptedFileTypes?: Record<string, string[]>;
    label?: string;
    existingImages?: string[];
    onRemoveExisting?: (url: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFilesSelected,
    maxFiles = 1,
    maxSize = 5 * 1024 * 1024, // 5MB default
    acceptedFileTypes = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    label = "Drag & drop your files here",
    existingImages = [],
    onRemoveExisting
}) => {
    const [previews, setPreviews] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Create previews
        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);

        setSelectedFiles(prev => {
            const newFiles = [...prev, ...acceptedFiles];
            onFilesSelected(newFiles); // Notify parent
            return newFiles;
        });
    }, [onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: maxFiles - (existingImages.length + selectedFiles.length),
        maxSize,
        accept: acceptedFileTypes,
        disabled: (existingImages.length + selectedFiles.length) >= maxFiles
    });

    const removeFile = (index: number) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]); // Cleanup memory
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-[30px] p-8 text-center cursor-pointer transition-all duration-300
                    ${isDragActive ? 'border-accent-crypto bg-accent-crypto/10' : 'border-bg-light hover:border-primary-black hover:bg-bg-light/30'}
                `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4 text-primary-dark-gray/60">
                    <div className="w-16 h-16 rounded-full bg-bg-light flex items-center justify-center">
                        <FaCloudUploadAlt size={32} />
                    </div>
                    <div>
                        <p className="font-bold text-sm uppercase tracking-widest">{isDragActive ? 'Drop files now' : label}</p>
                        <p className="text-[10px] mt-2">Max {maxSize / 1024 / 1024}MB per file • {Object.values(acceptedFileTypes).flat().join(', ')}</p>
                    </div>
                </div>
            </div>

            {/* Previews Grid */}
            {(existingImages.length > 0 || previews.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {existingImages.map((url, i) => (
                        <div key={`existing-${i}`} className="relative aspect-square rounded-2xl overflow-hidden group">
                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                            {onRemoveExisting && (
                                <button
                                    onClick={() => onRemoveExisting(url)}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <FaTimes size={12} />
                                </button>
                            )}
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] rounded-md backdrop-blur-sm">
                                Existing
                            </div>
                        </div>
                    ))}

                    {previews.map((url, i) => (
                        <div key={`new-${i}`} className="relative aspect-square rounded-2xl overflow-hidden group animate-fadeIn">
                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <FaImage className="text-white opacity-50 absolute" size={32} />
                            </div>
                            <button
                                onClick={() => removeFile(i)}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                            >
                                <FaTimes size={12} />
                            </button>
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-accent-anime text-white text-[10px] rounded-md">
                                New
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
