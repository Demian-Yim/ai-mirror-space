import React, { useState, useEffect } from 'react';
import type { GeneratedMedia, AppMessage } from '../types';
import { NeumorphicButton } from './NeumorphicButton';
import { dataUrlToFile } from '../utils/imageUtils';

interface ResultViewerProps {
    media: GeneratedMedia | null;
    isLoading: boolean;
    message: AppMessage | null;
    loadingMessage?: string;
    onDownload: () => void;
    onPromote: () => void;
    appMode: 'generate' | 'edit' | 'recompose';
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

export const ResultViewer: React.FC<ResultViewerProps> = ({ media, isLoading, message, loadingMessage, onDownload, onPromote, appMode }) => {
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        if (navigator.share && navigator.canShare) {
            setCanShare(true);
        }
    }, []);

    const handleShare = async () => {
        if (!media) return;

        try {
            const extension = media.type === 'image' ? 'png' : 'mp4';
            const safePrompt = media.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
            const fileName = `${safePrompt || 'ai-mirror-space'}-${media.id}.${extension}`;
            const file = await dataUrlToFile(media.src, fileName, media.mimeType);

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'AI Mirror Space Creation',
                    text: `I created this with AI Mirror Space! Prompt: ${media.prompt}`,
                    files: [file],
                });
            } else {
                 alert("This media cannot be shared on your device.");
            }
        } catch (err) {
            console.error("Sharing failed:", err);
        }
    };

    const getMessageColor = () => {
        if (!message) return '';
        switch (message.type) {
            case 'error':
                return 'text-[var(--error-color)]';
            case 'warning':
                return 'text-[var(--warning-color)]';
            default:
                return 'text-[var(--text-secondary)]';
        }
    };

    const promoteButtonText = appMode === 'generate' ? '✨ 이 이미지로 편집 고정' : '✨ 매직 툴로 편집';

    return (
        <div className="flex-grow flex items-center justify-center custom-inset p-2 rounded-2xl relative min-h-[300px]">
            {isLoading && (
                 <div className="text-center">
                    <Loader />
                    {loadingMessage && <p className="mt-4 text-lg font-semibold text-[var(--accent-color)] animate-[fadeIn_0.5s]">{loadingMessage}</p>}
                </div>
            )}
            {!isLoading && message && <p className={`text-center font-semibold px-4 ${getMessageColor()}`}>{message.text}</p>}
            {!isLoading && !message && !media && <WelcomeMessage />}
            {!isLoading && !message && media && (
                <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
                    <div className="relative w-full flex-grow flex items-center justify-center min-h-0">
                        {media.type === 'image' ? (
                            <img src={media.src} alt="Generated result" className="max-w-full max-h-full object-contain rounded-lg" />
                        ) : (
                            <video src={media.src} controls autoPlay loop muted className="max-w-full max-h-full object-contain rounded-lg" />
                        )}
                        <div className="absolute top-2 right-2 flex space-x-2">
                            {canShare && (
                                <NeumorphicButton
                                    onClick={handleShare}
                                    className="!p-2 !rounded-full"
                                    title="미디어 공유"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 110 2.684m0 2.684l6.632 3.316" />
                                    </svg>
                                </NeumorphicButton>
                            )}
                            <NeumorphicButton
                                onClick={onDownload}
                                className="!p-2 !rounded-full"
                                title="미디어 다운로드"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </NeumorphicButton>
                        </div>
                    </div>
                    {(appMode === 'recompose' || (appMode === 'generate' && media)) && media.type === 'image' && (
                        <NeumorphicButton
                            onClick={onPromote}
                            className="!px-4 !py-2 text-sm font-semibold"
                        >
                           {promoteButtonText}
                        </NeumorphicButton>
                    )}
                </div>
            )}
        </div>
    );
};