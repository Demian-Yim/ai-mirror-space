import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
import { ProcessGuide } from './components/ProcessGuide';
import { TutorialModal } from './components/TutorialModal';
import { STYLES, ENHANCEMENT_PROMPTS, INSPIRATION_PROMPTS, ASPECT_RATIOS, VIDEO_LOADING_MESSAGES } from './constants';
import type { Style, GeneratedMedia, AspectRatio, AppMessage } from './types';
import { initAiClient, editImageWithGemini, generateImageWithImagen, recomposeImagesWithGemini, generateVideoWithVeo } from './services/geminiService';
import { dataUrlToFile, getMimeType } from './utils/imageUtils';

declare const JSZip: any;

interface MixerValues {
    identityPreservation: number;
    styleMix: number;
    backgroundMix: number;
}

const App: React.FC = () => {
    // Theme State
    const [darkMode, setDarkMode] = useState<boolean>(false);

    // Initialization State
    const [isInitialized, setIsInitialized] = useState(false);
    const [initializationError, setInitializationError] = useState<string | null>(null);

    // Tutorial State
    const [showTutorial, setShowTutorial] = useState(false);

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
    const loadingMessageInterval = useRef<number | null>(null);

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

    useEffect(() => {
        // Theme initialization
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            setDarkMode(false);
            document.documentElement.setAttribute('data-theme', 'light');
        }

        try {
            initAiClient();
            setIsInitialized(true);
            
            // Check if tutorial has been seen
            const hasSeenTutorial = localStorage.getItem('hasSeenTutorial_v2');
            if (!hasSeenTutorial) {
                setShowTutorial(true);
            }
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : '알 수 없는 오류가 발생했습니다.';
            setInitializationError(errorMessage);
            console.error(error);
        }
    }, []);

    const toggleTheme = () => {
        setDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('theme', newMode ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
            return newMode;
        });
    };

    const closeTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem('hasSeenTutorial_v2', 'true');
    };

    const handleImageUpload = (file: File, sourceNumber: 1 | 2) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (sourceNumber === 1) {
                setSourceFile1(file);
                setSourceImage1(result);
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
            setSourceFile2(null);
            setSourceImage2(null);
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
                loadingMessageInterval.current = window.setInterval(() => {
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

        try {
            let result;
            let finalPrompt = prompt;

            if (appMode === 'recompose' && sourceImage1 && sourceFile1 && sourceImage2 && sourceFile2) {
                const base64Data1 = sourceImage1.split(',')[1];
                const mimeType1 = getMimeType(sourceFile1);
                const base64Data2 = sourceImage2.split(',')[1];
                const mimeType2 = getMimeType(sourceFile2);
                
                const { identityPreservation, styleMix, backgroundMix } = mixerValues;
                // Enhanced prompts for Nano Banana Pro (Gemini 3 Pro)
                const identityPrompt = `Primary Subject: Preserve identity/face from first image (${identityPreservation}% weight).`;
                const stylePrompt = `Artistic Style: Adopt style from second image (${styleMix}% weight).`;
                const backgroundPrompt = `Background: Blend background from second image (${backgroundMix}% weight).`;
                const userHint = prompt.trim() ? `User Instruction: "${prompt}"` : "";
                const styleEnhancement = selectedStyle ? `Style Preset: ${ENHANCEMENT_PROMPTS[selectedStyle]}` : '';

                finalPrompt = `Recompose these images. ${identityPrompt} ${stylePrompt} ${backgroundPrompt} ${userHint} ${styleEnhancement}`;

                result = await recomposeImagesWithGemini(base64Data1, mimeType1, base64Data2, mimeType2, finalPrompt);
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
                }

            } else if (sourceImage1 || activeResult) {
                 const imageToEditBase64 = activeResult?.src || sourceImage1;
                 if (!imageToEditBase64) throw new Error('수정할 이미지가 없습니다.');

                 if (!selectedStyle && !modificationPrompt && !prompt && ageModification === null) {
                    setMessage({ text: '스타일을 선택하거나 프롬프트를 입력해주세요.', type: 'warning' });
                    setIsLoading(false);
                    return;
                }
                const base64Data = imageToEditBase64.split(',')[1];
                const mimeType = activeResult?.mimeType || (sourceFile1 ? getMimeType(sourceFile1) : 'image/png');
                
                if(modificationPrompt) {
                    finalPrompt = modificationPrompt;
                } else if (ageModification !== null) {
                    const direction = ageModification > 0 ? 'older' : 'younger';
                    finalPrompt = `Make the person look ${Math.abs(ageModification)} years ${direction}. Preserve identity and style.`;
                } else if (selectedStyle) {
                    const styleEnhancement = ENHANCEMENT_PROMPTS[selectedStyle] || '';
                    finalPrompt = `${prompt}, ${styleEnhancement}`;
                }
                result = await editImageWithGemini(base64Data, mimeType, finalPrompt);
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
                }

            } else { 
                if (!prompt.trim()) {
                    setMessage({ text: '이미지를 생성하려면 프롬프트를 입력해주세요.', type: 'warning' });
                    setIsLoading(false);
                    return;
                }
                if (selectedStyle) {
                    const styleEnhancement = ENHANCEMENT_PROMPTS[selectedStyle] || '';
                    finalPrompt = `${prompt}, ${styleEnhancement}`;
                }
                // Using Nano Banana Pro (gemini-3-pro-image-preview) for text-to-image as well if needed, or specific high-quality model
                result = await generateImageWithImagen(finalPrompt, selectedAspectRatio);
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
                }
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

    const handleStyleSelect = (styleId: Style['id']) => {
        setSelectedStyle(prev => (prev === styleId ? null : styleId));
    };
    
    const handleAspectRatioSelect = (aspectRatioId: AspectRatio['id']) => {
        setSelectedAspectRatio(aspectRatioId);
        if (appMode !== 'generate') {
            setSourceImage1(null);
            setSourceFile1(null);
            setSourceImage2(null);
            setSourceFile2(null);
            setActiveResult(null);
            setMessage({ text: '비율을 변경하여 이미지 생성 모드로 전환되었습니다.', type: 'info' });
        }
    };
    
    const handleDownloadActiveMedia = useCallback(() => {
        if (!activeResult) return;
        const link = document.createElement('a');
        link.href = activeResult.src;
        const extension = activeResult.type === 'image' ? 'png' : 'mp4';
        const safePrompt = activeResult.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
        const fileName = `${safePrompt || 'ai-mirror-universe'}-${activeResult.id}.${extension}`;
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
            const fileName = `${safePrompt || 'ai-mirror-universe'}-${media.id}.${extension}`;
            const response = await fetch(media.src);
            const blob = await response.blob();
            zip.file(fileName, blob);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'ai-mirror-universe-gallery.zip';
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
            const fileName = `${safePrompt || 'ai-mirror-universe'}-${media.id}.${extension}`;
            const response = await fetch(media.src);
            const blob = await response.blob();
            zip.file(fileName, blob);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'ai-mirror-universe-all-media.zip';
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

    const isMagicToolsDisabled = isLoading || !(sourceImage1 || (activeResult && activeResult.type === 'image'));

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center h-screen bg-[var(--bg-main)]">
                <div className="text-center p-8 rounded-2xl bg-[var(--panel-bg-solid)] max-w-md mx-4 shadow-xl animate-[fadeInScale_0.3s_ease-out]">
                    {initializationError ? (
                        <>
                            <h1 className="text-2xl font-bold text-[var(--error-color)] mb-4">초기화 오류</h1>
                            <p className="text-[var(--text-secondary)]">{initializationError}</p>
                        </>
                    ) : (
                         <>
                            <h1 className="text-2xl font-bold pastel-gradient-text mb-4 text-[var(--accent-primary)]">AI Mirror Universe</h1>
                            <p className="text-[var(--text-secondary)]">Demian의 세계를 불러오고 있습니다...</p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[var(--bg-main)] text-[var(--text-primary)] overflow-hidden font-sans transition-colors duration-300">
            <div className="container mx-auto p-4 flex-grow flex flex-col min-h-0">
                <header className="flex flex-col md:flex-row justify-between items-center mb-4 flex-shrink-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight serif-font">
                            AI Mirror Universe
                        </h1>
                        <p className="text-base md:text-lg font-medium text-[var(--text-secondary)] mt-1 serif-font opacity-90">
                            페르소나 넥서스: 거울 속의 무한한 나
                        </p>
                        <p className="text-xs mt-1 text-[var(--text-tertiary)] italic">
                           "Demian 임정훈이 안내하는 자아 탐구의 여정"
                        </p>
                    </div>
                    <div className="flex gap-3 items-center">
                         <NeumorphicButton onClick={toggleTheme} className="!px-3 !py-2 !rounded-full" title={darkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}>
                            {darkMode ? '☀️ Day' : '🌙 Night'}
                        </NeumorphicButton>
                        <NeumorphicButton onClick={() => setShowTutorial(true)} className="!px-4 !py-2 !text-sm !font-semibold">
                            📖 사용 가이드
                        </NeumorphicButton>
                    </div>
                </header>

                <ProcessGuide />
                
                <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-grow min-h-0">
                    {/* Left Column: Sources */}
                    <aside className="lg:col-span-3 flex flex-col gap-4 animate-[fadeIn_0.5s_ease-out_forwards]" style={{ animationDelay: '200ms' }}>
                        <NeumorphicPanel className="flex-1 flex flex-col min-h-[250px] relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-primary)] transition-all group-hover:w-2"></div>
                            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2 serif-font pl-2">{isVideoMode ? '🎬 애니메이션 소스' : '👤 메인 소스'}</h2>
                            <ImageUploader onImageUpload={(file) => handleImageUpload(file, 1)} onClear={() => handleImageClear(1)} sourceImage={sourceImage1} />
                        </NeumorphicPanel>
                         { !isVideoMode &&
                            <NeumorphicPanel className="flex-1 flex flex-col min-h-[250px] relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-warm)] transition-all group-hover:w-2"></div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2 serif-font pl-2">🎨 스타일 & 배경</h2>
                                <ImageUploader
                                    onImageUpload={(file) => handleImageUpload(file, 2)}
                                    onClear={() => handleImageClear(2)}
                                    sourceImage={sourceImage2}
                                    disabled={!sourceImage1}
                                />
                            </NeumorphicPanel>
                        }
                    </aside>

                    {/* Center Column: Controls */}
                    <fieldset disabled={isLoading} className="lg:col-span-5 flex flex-col gap-4 min-h-0 animate-[fadeIn_0.5s_ease-out_forwards] transition-opacity duration-300 disabled:opacity-70 disabled:cursor-wait" style={{ animationDelay: '400ms' }}>
                        <NeumorphicPanel className="!p-3">
                            <div className="flex bg-[var(--inset-bg)] p-1.5 rounded-full border border-[var(--border-color)]">
                                <button onClick={() => setStudioMode('image')} className={`flex-1 py-2 text-center rounded-full transition-all duration-300 text-sm font-bold ${!isVideoMode ? 'bg-[var(--panel-bg-solid)] text-[var(--text-primary)] shadow-sm scale-105' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}>🌌 Image Galaxy</button>
                                <button onClick={() => setStudioMode('video')} className={`flex-1 py-2 text-center rounded-full transition-all duration-300 text-sm font-bold ${isVideoMode ? 'bg-[var(--panel-bg-solid)] text-[var(--text-primary)] shadow-sm scale-105' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}>🪐 Video Universe</button>
                            </div>
                        </NeumorphicPanel>
                        
                        <NeumorphicPanel className="flex-grow flex flex-col">
                             <div className="flex justify-between items-center mb-2">
                                <h2 className="text-lg font-bold text-[var(--text-primary)] serif-font">📝 프롬프트 (Prompt)</h2>
                                <button onClick={handleGetInspiration} disabled={isVideoMode} className="text-xs font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[var(--inset-bg)]">
                                    <span>✨ 영감 받기</span>
                                </button>
                            </div>
                            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-24 p-4 text-base rounded-xl custom-inset focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-shadow resize-none placeholder:text-[var(--text-tertiary)]" placeholder={promptPlaceholder}/>
                        </NeumorphicPanel>
                        
                        {appMode === 'recompose' && !isVideoMode && (
                            <MixerControls values={mixerValues} onChange={setMixerValues} />
                        )}
                        
                        <NeumorphicPanel className={`flex-grow flex gap-4 min-h-0 transition-opacity duration-300 ${isVideoMode ? 'opacity-40 pointer-events-none' : ''}`}>
                            <div className="flex-1 flex flex-col">
                                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2 serif-font">🎨 아트 스타일</h2>
                                <StyleSelector styles={STYLES} selectedStyle={selectedStyle} onSelectStyle={handleStyleSelect} />
                            </div>
                            
                            <div className='flex-1 flex flex-col pl-4 border-l border-[var(--border-color)]'>
                                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2 serif-font">🪄 Magic Tools</h2>
                                <PostProcessingControls onModify={handleCreate} disabled={isMagicToolsDisabled} />
                            </div>
                        </NeumorphicPanel>
                    </fieldset>

                    {/* Right Column: Results & Library */}
                    <aside className="lg:col-span-4 flex flex-col gap-4 animate-[fadeIn_0.5s_ease-out_forwards]" style={{ animationDelay: '600ms' }}>
                         <NeumorphicPanel className="flex flex-col flex-1 min-h-[400px] relative">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3 serif-font">💎 결과물 (Artifact)</h2>
                            <ResultViewer 
                                media={activeResult} 
                                isLoading={isLoading} 
                                message={message} 
                                loadingMessage={loadingMessage} 
                                onDownload={handleDownloadActiveMedia}
                                onPromote={handlePromoteResultToSource}
                                appMode={appMode}
                            />

                            <div className={`mt-4 transition-opacity duration-300 ${isVideoMode ? 'opacity-40 pointer-events-none' : ''}`}>
                                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Aspect Ratio</h3>
                                <AspectRatioSelector aspectRatios={ASPECT_RATIOS} selectedAspectRatio={selectedAspectRatio} onSelectAspectRatio={handleAspectRatioSelect} disabled={false}/>
                            </div>

                            <div className="pt-4 mt-auto">
                                <button onClick={() => handleCreate()} disabled={isCreationDisabled} className="w-full rounded-xl py-4 text-lg font-bold text-white bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-warm)] hover:opacity-90 transition-all duration-300 ease-out shadow-lg hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0">
                                    {isLoading ? (isVideoMode ? '애니메이션 제작 중...' : '자아 생성 중...') : (isVideoMode ? '🎬 페르소나 애니메이션 생성' : (appMode === 'recompose' ? '🧬 페르소나 결합하기' : '✨ 새로운 나 발견하기'))}
                                </button>
                            </div>
                        </NeumorphicPanel>

                        {generatedMedia.length > 0 && (
                            <NeumorphicPanel className="flex-grow min-h-[200px] flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-lg font-bold text-[var(--text-primary)] serif-font">🏛️ 갤러리</h2>
                                    <div className="flex gap-2">
                                        <button onClick={toggleSelectionMode} className="text-xs font-medium px-2 py-1 rounded hover:bg-[var(--inset-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                            {isSelectionMode ? '취소' : '선택'}
                                        </button>
                                        <button onClick={isSelectionMode ? downloadSelectedMedia : downloadAllMedia} className="text-xs font-bold px-2 py-1 rounded bg-[var(--inset-bg)] text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors">
                                            {isSelectionMode ? '선택 다운로드' : '전체 다운로드'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-grow overflow-y-auto custom-scrollbar">
                                    <ImageGallery images={generatedMedia} onImageClick={isSelectionMode ? toggleMediaSelection : openModal} isSelectionMode={isSelectionMode} selectedImageIds={selectedMediaIds}/>
                                </div>
                            </NeumorphicPanel>
                        )}
                    </aside>
                </main>
            </div>

            {/* Modals */}
            {isModalOpen && modalImageIndex !== null && (
                 <GalleryModal images={generatedMedia} startIndex={modalImageIndex} onClose={closeModal}/>
            )}
            
            {showTutorial && (
                <TutorialModal onClose={closeTutorial} />
            )}
            
            <footer className="text-center py-8 text-[var(--text-tertiary)] text-xs border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex-shrink-0 transition-colors">
                <p className="font-serif text-sm text-[var(--text-primary)] font-bold tracking-wide">Developed by Demian 임정훈</p>
                <p className="text-[var(--accent-primary)] font-bold mt-1 text-xs uppercase tracking-widest">HRD & AI Coach</p>
                <p className="mt-3 opacity-60">AI Mirror Universe © 2025. Powered by Google Gemini 3 Pro & Veo 3.1</p>
            </footer>
        </div>
    );
};

export default App;