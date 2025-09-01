import React, { useRef } from 'react';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    onClear: () => void;
    sourceImage: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onClear, sourceImage }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
        // Reset the input value to allow uploading the same file again
        event.target.value = '';
    };
    
    const handleClick = () => {
        if (!sourceImage) {
            inputRef.current?.click();
        }
    };
    
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClear();
    };

    return (
        <div 
            className="flex-grow flex items-center justify-center custom-inset p-2 rounded-2xl cursor-pointer min-h-[200px] relative group"
            onClick={handleClick}
        >
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
            {sourceImage ? (
                <>
                    <img src={sourceImage} alt="Source" className="max-w-full max-h-full object-contain rounded-lg" />
                    <button 
                        onClick={handleClear}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="이미지 지우기"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </>
            ) : (
                <div className="text-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <span className="text-4xl mb-2 block">↑</span>
                    <span className="font-semibold text-base">Upload Image</span>
                </div>
            )}
        </div>
    );
};