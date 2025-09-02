import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import type { GeneratedMedia } from '../types';

interface GalleryModalProps {
    images: GeneratedMedia[];
    startIndex: number;
    onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    const handleNext = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }, [images.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, handleNext, handlePrev]);

    const currentMedia = images[currentIndex];
    if (!currentMedia) return null;

    const modalContent = (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]"
            onClick={onClose}
        >
            <div 
                className="relative bg-[var(--panel-bg)] p-4 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-[90%] flex flex-col border border-[var(--border-color)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-grow flex items-center justify-center min-h-0">
                    {currentMedia.type === 'image' ? (
                        <img 
                            src={currentMedia.src} 
                            alt={currentMedia.prompt} 
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    ) : (
                        <video 
                            src={currentMedia.src} 
                            controls 
                            autoPlay 
                            loop 
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    )}
                </div>
                <p className="w-full text-center p-2 mt-4 custom-inset rounded-lg text-sm text-[var(--text-secondary)]">
                    {currentMedia.prompt}
                </p>
                 <button onClick={onClose} className="absolute -top-4 -right-4 bg-[var(--panel-bg)] rounded-full p-2 shadow-lg hover:scale-110 transition-transform border border-[var(--border-color)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-[var(--panel-bg)]/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:scale-110 transition-transform border border-[var(--border-color)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-[var(--panel-bg)]/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:scale-110 transition-transform border border-[var(--border-color)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            <div className="absolute bottom-4 text-white text-lg bg-black/50 px-4 py-1 rounded-full">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
    
    const portalRoot = document.getElementById('root');
    return portalRoot ? ReactDOM.createPortal(modalContent, portalRoot) : null;
};
