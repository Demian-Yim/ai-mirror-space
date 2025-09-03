import React, { useRef } from 'react';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    onClear: () => void;
    sourceImage: string | null;
    disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onClear, sourceImage, disabled = false }) => {
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
        if (!sourceImage && !disabled) {
            inputRef.current?.click();
        }
    };
    
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClear();
    };

    return (
        <div 
            className={`flex-grow flex items-center justify-center custom-inset p-2 rounded-2xl min-h-[200px] relative transition-opacity duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`}
            onClick={handleClick}
            title={disabled ? '메인 소스를 먼저 업로드해주세요.' : '이미지 업로드'}
        >
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={disabled}
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
                disabled ? (
                     <div className="text-center text-[var(--text-tertiary)]">
                        <span className="text-3xl mb-2 block">🔒</span>
                        <span className="font-semibold text-sm leading-tight">메인 소스를 먼저<br/>업로드해주세요.</span>
                    </div>
                ) : (
                    <div className="text-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        <span className="text-3xl mb-2 block">↑</span>
                        <span className="font-semibold text-sm">Upload Image</span>
                    </div>
                )
            )}
        </div>
    );
};