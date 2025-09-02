import React from 'react';
import type { GeneratedMedia } from '../types';

interface ImageGalleryProps {
    images: GeneratedMedia[];
    onImageClick: (id: number) => void;
    isSelectionMode: boolean;
    selectedImageIds: Set<number>;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onImageClick, isSelectionMode, selectedImageIds }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 custom-inset rounded-2xl">
            {images.map((media, index) => {
                const isSelected = selectedImageIds.has(media.id);
                return (
                    <div
                        key={media.id}
                        onClick={() => onImageClick(media.id)}
                        className={`relative aspect-square rounded-xl cursor-pointer overflow-hidden transition-all duration-200 group opacity-0 animate-[fadeInScale_0.5s_ease-out_forwards] ${
                            isSelected ? 'ring-4 ring-offset-4 ring-offset-[var(--bg-main)] ring-[var(--accent-color)] scale-95' : 'hover:scale-105'
                        }`}
                        style={{ animationDelay: `${index * 75}ms` }}
                    >
                        {media.type === 'image' ? (
                            <img
                                src={media.src}
                                alt={media.prompt}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                             <div className="w-full h-full bg-black flex items-center justify-center">
                                <video src={media.src} className="w-full h-full object-cover" preload="metadata" muted />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                            {media.prompt}
                        </div>
                         {isSelectionMode && (
                            <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-[var(--accent-color)]' : 'bg-black/30'
                            }`}>
                                {isSelected && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
