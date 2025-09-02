

import React, { useState, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ImageUploader } from './components/ImageUploader';
import { StyleSelector } from './components/StyleSelector';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { ResultViewer } from './components/ResultViewer';
import { PostProcessingControls } from './components/PostProcessingControls';
import { ImageGallery } from './components/ImageGallery';
import { GalleryModal } from './components/GalleryModal';
import { MixerControls } from './components/MixerControls';
import { NeumorphicPanel } from './components/NeumorphicPanel';
import { NeumorphicButton } from './components/NeumorphicButton';
import { STYLES, ENHANCEMENT_PROMPTS, INSPIRATION_PROMPTS, ASPECT_RATIOS, VIDEO_LOADING_MESSAGES } from './constants';
import type { Style, GeneratedMedia, AspectRatio, AppMessage } from './types';
import { editImageWithGemini, generateImageWithImagen, recomposeImagesWithGemini, generateVideoWithVeo } from './services/geminiService';
import { dataUrlToFile, getMimeType } from './utils/imageUtils';

declare const JSZip: any;

interface MixerValues {
    identityPreservation: number;
    styleMix: number;
    backgroundMix: number;
}

const App: React.FC = () => {
    // Core state
    const [sourceImage1, setSourceImage1] = useState<string | null>(null);
    const [sourceFile1, setSourceFile1] = useState<File | null>(null);
    const [sourceImage2, setSourceImage2] = useState<string | null>(null);
    const [sourceFile2, setSourceFile2] = useState<File | null>(null);
    const [mixerValues, setMixerValues] = useState<MixerValues>({
        identityPreservation: 100,
        styleMix: 100,
        backgroundMix: 100,
    });

    const [prompt, setPrompt] = useState<string>('');
    const [selectedStyle, setSelectedStyle] = useState<Style['id'] | null>(null);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio['id']>('1:1');
    const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia[]>([]);
    const [activeResult, setActiveResult] = useState<GeneratedMedia | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<AppMessage | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const loadingMessageInterval = useRef<NodeJS.Timeout | null>(null);

    // App mode state
    const [studioMode, setStudioMode] = useState<'image' | 'video'>('image');
    
    // Gallery and Modal State
    const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
    const [selectedMediaIds, setSelectedMediaIds] = useState<Set<number>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
    
    const appMode = useMemo(() => {
        if (sourceImage1 && sourceImage2) return 'recompose';
        if (sourceImage1) return 'edit';
        return 'generate';
    }, [sourceImage1, sourceImage2]);

    const handleImageUpload = (file: File, sourceNumber: 1 | 2) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (sourceNumber === 1) {
                setSourceFile1(file);
                setSourceImage1(result);
                 // If a prompt-only result was active, uploading a source image overrides it
                // for the next edit operation, providing a clearer user workflow.
                if (appMode !== 'recompose') {
                    setActiveResult(null);
                }
            } else {
                setSourceFile2(file);
                setSourceImage2(result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleImageClear = (sourceNumber: 1 | 2) => {
        if (sourceNumber === 1) {
            setSourceFile1(null);
            setSourceImage1(null);
        } else {
            setSourceFile2(null);
            setSourceImage2(null);
        }
    };

    const handleGetInspiration = () => {
        const randomIndex = Math.floor(Math.random() * INSPIRATION_PROMPTS.length);
        setPrompt(INSPIRATION_PROMPTS[randomIndex]);
    };

    const handleCreate = useCallback(async (modificationPrompt: string = '', ageModification: number | null = null) => {
        setIsLoading(true);
        setMessage(null);
        setLoadingMessage('');

        // ===== VIDEO GENERATION LOGIC =====
        if (studioMode === 'video') {
            if (!sourceImage1 || !sourceFile1) {
                setMessage({ text: '비디오를 생성하려면 소스 이미지를 업로드해주세요.', type: 'warning' });
                setIsLoading(false);
                return;
            }
            if (!prompt.trim()) {
                setMessage({ text: '비디오를 생성하려면 프롬프트를 입력해주세요.', type: 'warning' });
                setIsLoading(false);
                return;
            }
            try {
                let messageIndex = 0;
                setLoadingMessage(VIDEO_LOADING_MESSAGES[messageIndex]);
                loadingMessageInterval.current = setInterval(() => {
                    messageIndex = (messageIndex + 1) % VIDEO_LOADING_MESSAGES.length;
                    setLoadingMessage(VIDEO_LOADING_MESSAGES[messageIndex]);
                }, 4000);

                const onProgress = (progressMsg: string) => {
                    if (loadingMessageInterval.current) clearInterval(loadingMessageInterval.current);
                    setLoadingMessage(progressMsg);
                }

                const base64Data = sourceImage1.split(',')[1];
                const mimeType = getMimeType(sourceFile1);
                const result = await generateVideoWithVeo(base64Data, mimeType, prompt, onProgress);

                const newVideo: GeneratedMedia = {
                    id: Date.now(),
                    type: 'video',
                    src: result.videoUrl,
                    prompt: prompt,
                    mimeType: result.mimeType,
                };
                setGeneratedMedia(prev => [newVideo, ...prev]);
                setActiveResult(newVideo);
            } catch (err) {
                console.error(err);
                const errorMessage = (err instanceof Error) ? err.message : '비디오 생성에 실패했습니다.';
                setMessage({ text: errorMessage, type: 'error' });
            } finally {
                setIsLoading(false);
                if (loadingMessageInterval.current) clearInterval(loadingMessageInterval.current);
                setLoadingMessage('');
            }
            return;
        }

        // ===== IMAGE GENERATION LOGIC =====
        try {
            let result;
            let finalPrompt = prompt;
            const isPromptOnlyGeneration = !sourceImage1 && !sourceImage2 && prompt.trim();

            if (appMode === 'recompose' && sourceImage1 && sourceFile1 && sourceImage2 && sourceFile2) {
                const base64Data1 = sourceImage1.split(',')[1];
                const mimeType1 = getMimeType(sourceFile1);
                const base64Data2 = sourceImage2.split(',')[1];
                const mimeType2 = getMimeType(sourceFile2);
                
                const { identityPreservation, styleMix, backgroundMix } = mixerValues;
                const identityPrompt = `The subject's core identity and facial features from the first image should be preserved with ${identityPreservation}% strength. A lower percentage allows for more fusion with the features from the second image.`;
                const stylePrompt = `The final artistic style should be a blend, taking ${styleMix}% from the second image's style and ${100-styleMix}% from the first image's style.`;
                const backgroundPrompt = `The background should be a blend, taking ${backgroundMix}% from the second image's background and ${100-backgroundMix}% from the first image's background.`;
                const userHint = prompt.trim() ? `An additional user instruction: "${prompt}"` : "Create a seamless and realistic blend.";
                const styleEnhancement = selectedStyle ? `Additionally, render the final image in a ${ENHANCEMENT_PROMPTS[selectedStyle]} style.` : '';


                finalPrompt = `You are an expert image mixer. Combine the two provided images according to these rules:
1. ${identityPrompt}
2. ${stylePrompt}
3. ${backgroundPrompt}
${userHint}
${styleEnhancement}`;

                result = await recomposeImagesWithGemini(base64Data1, mimeType1, base64Data2, mimeType2, finalPrompt);

            } else if (sourceImage1 || activeResult) {
                 const imageToEditBase64 = activeResult?.src || sourceImage1;
                 if (!imageToEditBase64) throw new Error('수정할 이미지가 없습니다.');

                 if (!selectedStyle && !modificationPrompt && !prompt && ageModification === null) {
                    setMessage({ text: '스타일을 선택하거나 프롬프트를 입력해주세요.', type: 'warning' });
                    setIsLoading(false);
                    return;
                }
                const base64Data = imageToEditBase64.split(',')[1];
                
                // Determine the mime type from the active result if available, otherwise from the source file.
                // This ensures post-processing on a generated PNG result uses the correct mime type.
                const mimeType = activeResult?.mimeType || (sourceFile1 ? getMimeType(sourceFile1) : 'image/png');
                
                if(modificationPrompt) {
                    finalPrompt = modificationPrompt;
                } else if (ageModification !== null) {
                    const direction = ageModification > 0 ? 'older' : 'younger';
                    finalPrompt = `Make the person look ${Math.abs(ageModification)} years ${direction}, while keeping the original style.`;
                } else if (selectedStyle) {
                    const styleEnhancement = ENHANCEMENT_PROMPTS[selectedStyle] || '';
                    finalPrompt = `${prompt}, ${styleEnhancement}`;
                }
                result = await editImageWithGemini(base64Data, mimeType, finalPrompt);

            } else { // Prompt-only generation
                if (!prompt.trim()) {
                    setMessage({ text: '이미지를 생성하려면 프롬프트를 입력해주세요.', type: 'warning' });
                    setIsLoading(false);
                    return;
                }
                if (selectedStyle) {
                    const styleEnhancement = ENHANCEMENT_PROMPTS[selectedStyle] || '';
                    finalPrompt = `${prompt}, ${styleEnhancement}`;
                }
                result = await generateImageWithImagen(finalPrompt, selectedAspectRatio);
            }

            if (result.image) {
                const newImage: GeneratedMedia = {
                    id: Date.now(),
                    type: 'image',
                    src: result.image,
                    prompt: finalPrompt,
                    mimeType: result.mimeType || 'image/png'
                };
                setGeneratedMedia(prev => [newImage, ...prev]);
                setActiveResult(newImage);

                if (isPromptOnlyGeneration) {
                     // After a prompt-only generation, the result becomes the new source,
                    // allowing for immediate editing with magic tools.
                    setSourceImage1(newImage.src);
                    const newSourceFile = await dataUrlToFile(newImage.src, `prompt-generated-${newImage.id}.png`, newImage.mimeType);
                    setSourceFile1(newSourceFile);
                }
            }
             if (result.text) {
                console.log("Gemini says: ", result.text);
            }
            
        } catch (err) {
            console.error(err);
            const errorMessage = (err instanceof Error) ? err.message : '이미지 생성에 실패했습니다. 다시 시도해주세요.';
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [studioMode, sourceImage1, sourceFile1, sourceImage2, sourceFile2, prompt, selectedStyle, activeResult, selectedAspectRatio, mixerValues, appMode]);
    
    const handlePromoteResultToSource = useCallback(async () => {
        if (!activeResult || activeResult.type !== 'image') return;
        try {
            const newSourceFile = await dataUrlToFile(activeResult.src, `promoted-${activeResult.id}.png`, activeResult.mimeType);
            setSourceImage1(activeResult.src);
            setSourceFile1(newSourceFile);
            setSourceImage2(null);
            setSourceFile2(null);
        } catch(err) {
            console.error("Error promoting result to source:", err);
            setMessage({ text: '결과를 편집 소스로 설정하는 데 실패했습니다.', type: 'error' });
        }
    }, [activeResult]);

    const handleStyleSelect = (styleId: Style['id']) => setSelectedStyle(prev => (prev === styleId ? null : styleId));
    const handleAspectRatioSelect = (aspectRatioId: AspectRatio['id']) => setSelectedAspectRatio(aspectRatioId);
    
    const handleDownloadActiveMedia = useCallback(() => {
        if (!activeResult) return;
        const link = document.createElement('a');
        link.href = activeResult.src;
        const extension = activeResult.type === 'image' ? 'png' : 'mp4';
        const safePrompt = activeResult.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
        const fileName = `${safePrompt || 'ai-mirror-space'}-${activeResult.id}.${extension}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [activeResult]);

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedMediaIds(new Set());
    };

    const toggleMediaSelection = (mediaId: number) => {
        setSelectedMediaIds(prev => {
            const newSet = new Set(prev);
            newSet.has(mediaId) ? newSet.delete(mediaId) : newSet.add(mediaId);
            return newSet;
        });
    };

    const downloadSelectedMedia = async () => {
        if (selectedMediaIds.size === 0) {
            setMessage({ text: '저장할 미디어를 선택해주세요.', type: 'warning' });
            return;
        }
        const zip = new JSZip();
        const mediaToDownload = generatedMedia.filter(m => selectedMediaIds.has(m.id));
        for (const media of mediaToDownload) {
            const extension = media.type === 'image' ? 'png' : 'mp4';
            const safePrompt = media.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
            const fileName = `${safePrompt || 'ai-mirror-space'}-${media.id}.${extension}`;
            const response = await fetch(media.src);
            const blob = await response.blob();
            zip.file(fileName, blob);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'ai-mirror-space-gallery.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };
    
    const downloadAllMedia = async () => {
        if (generatedMedia.length === 0) return;
        const zip = new JSZip();
        for (const media of generatedMedia) {
            const extension = media.type === 'image' ? 'png' : 'mp4';
            const safePrompt = media.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
            const fileName = `${safePrompt || 'ai-mirror-space'}-${media.id}.${extension}`;
            const response = await fetch(media.src);
            const blob = await response.blob();
            zip.file(fileName, blob);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'ai-mirror-space-all-media.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    const openModal = (mediaId: number) => {
        const imageIndex = generatedMedia.findIndex(img => img.id === mediaId);
        if (imageIndex > -1) {
            setModalImageIndex(imageIndex);
            setIsModalOpen(true);
        }
    };
    const closeModal = () => setIsModalOpen(false);
    
    const isCreationDisabled = useMemo(() => {
        if (isLoading) return true;
        if (studioMode === 'video') return !sourceImage1 || !prompt.trim();
        return !sourceImage1 && !sourceImage2 && !prompt.trim();
    }, [isLoading, studioMode, sourceImage1, sourceImage2, prompt]);

    const isVideoMode = studioMode === 'video';

    const promptPlaceholder = {
        generate: '상상 속 당신의 모습을 묘사해보세요...',
        edit: '이 이미지를 어떻게 바꾸고 싶으신가요?',
        recompose: '두 이미지의 조합에 대한 추가 지시사항...',
        video: '인물에게 어떤 움직임을 줄까요? (예: 손 흔들기)'
    }[isVideoMode ? 'video' : appMode];

    return (
        <div className="flex flex-col min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
            <div className="container mx-auto p-4 md:p-8 flex-grow flex flex-col">
                <header className="text-center mb-12 animate-[fadeIn_0.5s_ease-out_forwards] opacity-0">
                    <h1 className="text-5xl md:text-6xl neon-title">AI Mirror Space</h1>
                    <p className="text-lg md:text-xl mt-4 text-[var(--text-secondary)] font-medium tracking-wide">AI 거울을 통해 새로운 나를 발견하는 공간</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
                    <aside className="lg:col-span-3 flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out_forwards] opacity-0" style={{ animationDelay: '200ms' }}>
                        <NeumorphicPanel className="flex-1 flex flex-col">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{isVideoMode ? '애니메이션 소스' : source1Title[appMode]}</h2>
                            <ImageUploader onImageUpload={(file) => handleImageUpload(file, 1)} onClear={() => handleImageClear(1)} sourceImage={sourceImage1} />
                        </NeumorphicPanel>
                         <div className={`flex-1 flex flex-col transition-opacity duration-300 ${isVideoMode ? 'opacity-0 pointer-events-none h-0' : 'opacity-100 h-auto'}`}>
                            <NeumorphicPanel className="h-full flex flex-col">
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{source2Title[appMode]}</h2>
                                <ImageUploader onImageUpload={(file) => handleImageUpload(file, 2)} onClear={() => handleImageClear(2)} sourceImage={sourceImage2} />
                            </NeumorphicPanel>
                        </div>
                    </aside>

                    <fieldset disabled={isLoading} className="lg:col-span-6 flex flex-col animate-[fadeIn_0.5s_ease-out_forwards] opacity-0 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-wait" style={{ animationDelay: '400ms' }}>
                        <section className="space-y-6 flex flex-col flex-grow">
                             <div className="flex bg-[var(--panel-bg-solid)] p-1 rounded-full border border-[var(--border-color)]">
                                <button onClick={() => setStudioMode('image')} className={`flex-1 py-2 text-center rounded-full transition-colors ${!isVideoMode ? 'bg-[var(--accent-color)] text-white font-bold' : 'text-[var(--text-secondary)] hover:text-white'}`}>📷 이미지 스튜디오</button>
                                <button onClick={() => setStudioMode('video')} className={`flex-1 py-2 text-center rounded-full transition-colors ${isVideoMode ? 'bg-[var(--accent-color)] text-white font-bold' : 'text-[var(--text-secondary)] hover:text-white'}`}>🎬 비디오 페르소나</button>
                            </div>

                            <NeumorphicPanel>
                                 <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-[var(--text-primary)]">1. 프롬프트 입력</h2>
                                    <NeumorphicButton onClick={handleGetInspiration} title="새로운 영감 받기" className="!p-2 !rounded-full text-xl !bg-transparent" disabled={isVideoMode}>💡</NeumorphicButton>
                                </div>
                                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-24 p-4 text-base rounded-xl custom-inset focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]" placeholder={promptPlaceholder}/>
                            </NeumorphicPanel>
                            
                            {appMode === 'recompose' && !isVideoMode && (
                                <MixerControls values={mixerValues} onChange={setMixerValues} />
                            )}
                            
                            <div className={`transition-opacity duration-300 ${isVideoMode ? 'opacity-40 pointer-events-none' : ''}`}>
                                <NeumorphicPanel className="flex-grow flex flex-col">
                                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">2. 스타일 선택</h2>
                                    <StyleSelector styles={STYLES} selectedStyle={selectedStyle} onSelectStyle={handleStyleSelect} />
                                </NeumorphicPanel>
                            </div>

                            <div className={`transition-opacity duration-300 ${isVideoMode ? 'opacity-40 pointer-events-none' : ''}`}>
                                <NeumorphicPanel>
                                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">3. 사진 비율 선택</h2>
                                    <AspectRatioSelector aspectRatios={ASPECT_RATIOS} selectedAspectRatio={selectedAspectRatio} onSelectAspectRatio={handleAspectRatioSelect} disabled={appMode !== 'generate'}/>
                                </NeumorphicPanel>
                            </div>

                            <div className={`transition-opacity duration-300 ${isVideoMode || appMode === 'recompose' ? 'opacity-40 pointer-events-none' : ''}`}>
                                <NeumorphicPanel className="neon-glow-panel">
                                    <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">✨ AI Magic Tools</h2>
                                    <p className="text-xs text-center text-[var(--text-secondary)] mb-6">결과물에 적용하여 연속적으로 수정할 수 있습니다.</p>
                                    <PostProcessingControls onModify={handleCreate} disabled={isLoading || !sourceImage1} />
                                </NeumorphicPanel>
                            </div>
                            
                             <div className="pt-2 mt-auto">
                                 <button onClick={() => handleCreate()} disabled={isCreationDisabled} className="main-generate-button w-full rounded-full py-4 px-10 text-xl font-bold text-white bg-[var(--accent-color)] transition-all duration-300 ease-in-out shadow-lg hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--text-tertiary)] disabled:shadow-none">
                                    {isLoading ? (isVideoMode ? '애니메이션 제작 중...' : '생성 중...') : (isVideoMode ? '페르소나 생성하기' : (appMode === 'recompose' ? '결합하기' : '발견하기'))}
                                </button>
                            </div>
                        </section>
                    </fieldset>

                    <aside className="lg:col-span-3 flex flex-col animate-[fadeIn_0.5s_ease-out_forwards] opacity-0" style={{ animationDelay: '600ms' }}>
                         <NeumorphicPanel className="h-full flex flex-col">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">결과물</h2>
                            <ResultViewer 
                                media={activeResult} 
                                isLoading={isLoading} 
                                message={message} 
                                loadingMessage={loadingMessage} 
                                onDownload={handleDownloadActiveMedia}
                                onPromote={handlePromoteResultToSource}
                                appMode={appMode}
                            />
                        </NeumorphicPanel>
                    </aside>
                </main>
                
                {generatedMedia.length > 0 && (
                    <section className="mt-12 animate-[fadeIn_1s_ease-out]">
                        <NeumorphicPanel>
                             <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">라이브러리 앨범</h2>
                                <div className="flex items-center space-x-2">
                                    {isSelectionMode ? (
                                        <>
                                            <span className="text-sm font-semibold text-[var(--text-secondary)] mr-2">{selectedMediaIds.size}개 선택됨</span>
                                            <NeumorphicButton onClick={downloadSelectedMedia} className="!px-3 !py-2 text-sm" disabled={selectedMediaIds.size === 0}>선택 다운로드</NeumorphicButton>
                                            <NeumorphicButton onClick={toggleSelectionMode} className="!px-3 !py-2 text-sm">취소</NeumorphicButton>
                                        </>
                                    ) : (
                                        <>
                                            <NeumorphicButton onClick={downloadAllMedia} className="!px-3 !py-2 text-sm">전체 다운로드</NeumorphicButton>
                                            <NeumorphicButton onClick={toggleSelectionMode} className="!px-3 !py-2 text-sm">선택</NeumorphicButton>
                                        </>
                                    )}
                                </div>
                            </div>
                            <ImageGallery images={generatedMedia} onImageClick={isSelectionMode ? toggleMediaSelection : openModal} isSelectionMode={isSelectionMode} selectedImageIds={selectedMediaIds}/>
                        </NeumorphicPanel>
                    </section>
                )}
            </div>

            {isModalOpen && modalImageIndex !== null && (
                 <GalleryModal images={generatedMedia} startIndex={modalImageIndex} onClose={closeModal}/>
            )}
            
            <div className="text-center py-12 px-4 mt-8">
                <blockquote className="max-w-3xl mx-auto text-lg text-[var(--text-secondary)] italic">
                    <p>"거울은 현재의 나를 보여주지만, 아바타는 가능성의 나를 보여줍니다.<br />AI 거울 속에서, 당신의 무한한 자아를 탐색하세요."</p>
                </blockquote>
            </div>

            <footer className="text-center py-8 text-[var(--text-tertiary)] text-base">
                <p className="font-semibold neon-text-subtle">© Created by Demian 임정훈</p>
            </footer>
        </div>
    );
};

// Helper titles - keeping them local as they are only used here
const source1Title: Record<string, string> = {
    generate: '소스 1 (선택사항)',
    edit: '편집할 이미지',
    recompose: '주요 피사체 (인물)'
};
const source2Title: Record<string, string> = {
    generate: '소스 2 (선택사항)',
    edit: '소스 2 (결합 시 사용)',
    recompose: '스타일 & 배경'
};

export default App;