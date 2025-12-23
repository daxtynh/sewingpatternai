'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { usePatternStore } from '@/store/usePatternStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function ImageUploader() {
  const { uploadedImage, setUploadedImage } = usePatternStore();
  const [preview, setPreview] = useState<string | null>(uploadedImage);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        setUploadedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  }, [setUploadedImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleRemove = () => {
    setPreview(null);
    setUploadedImage(null);
  };

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
        <img
          src={preview}
          alt="Uploaded garment"
          className="w-full h-64 object-contain"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRemove}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-sm"
        >
          <X className="w-4 h-4 mr-1" />
          Remove
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
          {isDragActive ? (
            <Upload className="w-8 h-8 text-indigo-600" />
          ) : (
            <ImageIcon className="w-8 h-8 text-indigo-600" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium text-gray-900">
            {isDragActive ? 'Drop your image here' : 'Upload a garment image'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG, WEBP up to 10MB
          </p>
        </div>
      </div>
    </div>
  );
}
