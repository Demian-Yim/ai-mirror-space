import React, { useState, useEffect } from 'react';
import type { GeneratedImage } from '../types';
import { NeumorphicButton } from './NeumorphicButton';
import { dataUrlToFile } from '../utils/imageUtils';

interface ResultViewerProps {
    image: GeneratedImage | null;
    isLoading: boolean;
    error: string | null;
    onDownload: () => void;
}

const Loader: React.FC = () => (
    <div className="border-4 border-gray-200 border-t-4 border-t-[var(--accent-color)] rounded-full w-16 h-16 animate-spin"></div>
);

const WelcomeMessage: React.FC = () => (
    <div className="text-center text-[var(--text-secondary)]">
        <p className="text-5xl mb-4">🎨</p>
        <h2 className="text-2xl font-semibold">결과물이 표시될 공간</h2>
    </div>
);

export const ResultViewer: React.FC<ResultViewerProps> = ({ image, isLoading, error, onDownload }) => {
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        if (navigator.share && navigator.canShare) {
            setCanShare(true);
        }
    }, []);

    const handleShare = async () => {
        if (!image) return;

        try {
            const safePrompt = image.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
            const fileName = `${safePrompt || 'ai-mirror-space'}-${image.id}.png`;
            const file = await dataUrlToFile(image.src, fileName);

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'AI Mirror Space Creation',
                    text: `I created this image with AI Mirror Space! Prompt: ${image.prompt}`,
                    files: [file],
                });
            } else {
                 alert("This image cannot be shared.");
            }
        } catch (err) {
            console.error("Sharing failed:", err);
        }
    };


    return (
        <div className="flex-grow flex items-center justify-center custom-inset p-2 rounded-2xl relative min-h-[300px]">
            {isLoading && <Loader />}
            {!isLoading && error && <p className="text-red-500 text-center font-semibold">{error}</p>}
            {!isLoading && !error && !image && <WelcomeMessage />}
            {!isLoading && !error && image && (
                <div className="relative w-full h-full flex items-center justify-center">
                    <img src={image.src} alt="Generated result" className="max-w-full max-h-full object-contain rounded-lg" />
                    <div className="absolute top-2 right-2 flex space-x-2">
                         {canShare && (
                            <NeumorphicButton
                                onClick={handleShare}
                                className="!p-2 !rounded-full"
                                title="이미지 공유"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3