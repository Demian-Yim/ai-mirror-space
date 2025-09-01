
import React, { useState, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ImageUploader } from './components/ImageUploader';
import { StyleSelector } from './components/StyleSelector';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { ResultViewer } from './components/ResultViewer';
import { PostProcessingControls } from './components/PostProcessingControls';
import { ImageGallery } from './components/ImageGallery';
import { GalleryModal } from './components/GalleryModal';
import { NeumorphicPanel } from './components/NeumorphicPanel';
import { NeumorphicButton } from './components/NeumorphicButton';
import { STYLES, ENHANCEMENT_PROMPTS, INSPIRATION_PROMPTS, ASPECT_RATIOS } from './constants';
import type { Style, GeneratedImage, AspectRatio } from './types';
import { editImageWithGemini, generateImageWithImagen, recomposeImagesWithGemini } from './services/geminiService';
import { getMimeType } from './utils/imageUtils';

declare const JSZip: any;

const App: React.FC = () => {
    const [sourceImage1, setSourceImage1] = useState<string | null>(null);
    const [sourceFile1, setSourceFile1] = useState<File | null>(null);
    const [sourceImage2, setSourceImage2] = useState<string | null>(null);
    const [sourceFile2, setSourceFile2] = useState<File | null>(null);

    const [prompt, setPrompt] = useState<string>('');
    const [selectedStyle, setSelectedStyle] = useState<Style['id'] | null>(null);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio['id']>('1:1');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [activeResult, setActiveResult] = useState<GeneratedImage | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Gallery and Modal State
    const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
    const [selectedImageIds, setSelectedImageIds] = useState<Set<number>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
    
    const handleImageUpload = (file: File, sourceNumber: 1 | 2) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (sourceNumber === 1) {
                setSourceFile1(file);
                setSourceImage1(result);
            } else {
                setSourceFile2(file);
                setSourceImage2(result);
            }
            setActiveResult(null); 
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

    const handleGenerate = useCallback(async (modificationPrompt: string = '', ageModification: number | null = null) => {
        setIsLoading(true);
        setError(null);

        try {
            let result;
            let finalPrompt = prompt;

            // Mode 1: Dual Image Recomposition
            if (sourceImage1 && sourceImage2) {
                const base64Data1 = sourceImage1.split(',')[1];
                const mimeType1 = sourceFile1 ? getMimeType(sourceFile1) : 'image/png';
                const base64Data2 = sourceImage2.split(',')[1];
                const mimeType2 = sourceFile2 ? getMimeType(sourceFile2) : 'image/png';
                finalPrompt = prompt || "Combine the subject from the first image with the style and background of the second image.";
                result = await recomposeImagesWithGemini(base64Data1, mimeType1, base64Data2, mimeType2, finalPrompt);
            }
            // Mode 2: Single Image Editing
            else if (sourceImage1) {
                 const imageToEditBase64 = activeResult ? activeResult.src : sourceImage1;
                 if (!imageToEditBase64) throw new Error('수정할 이미지가 없습니다.');

                 if (!selectedStyle && !modificationPrompt && !prompt && ageModification === null) {
                    alert('스타일을 선택하거나 프롬프트를 입력해주세요.');
                    setIsLoading(false);
                    return;
                }
                const base64Data = imageToEditBase64.split(',')[1];
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
            }
            // Mode 3: Text-to-Image Generation
            else {
                if (!prompt.trim()) {
                    alert('이미지를 생성하려면 프롬프트를 입력해주세요.');
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
                const newImage: GeneratedImage = {
                    id: Date.now(),
                    src: result.image,
                    prompt: finalPrompt,
                    mimeType: result.mimeType || 'image/png'
                };
                setGeneratedImages(prev => [newImage, ...prev]);
                setActiveResult(newImage);
            }
             if (result.text) {
                console.log("Gemini says: ", result.text);
            }
            
        } catch (err) {
            console.error(err);
            const errorMessage = (err instanceof Error) ? err.message : '이미지 생성에 실패했습니다. 다시 시도해주세요.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [sourceImage1, sourceFile1, sourceImage2, sourceFile2, prompt, selectedStyle, activeResult, selectedAspectRatio]);


    const handleStyleSelect = (styleId: Style['id']) => {
        setSelectedStyle(prev => (prev === styleId ? null : styleId));
    };

    const handleAspectRatioSelect = (aspectRatioId: AspectRatio['id']) => {
        setSelectedAspectRatio(aspectRatioId);
    };
    
    const handleDownloadActiveImage = useCallback(() => {
        if (!activeResult) return;
        const link = document.createElement('a');
        link.href = activeResult.src;
        const safePrompt = activeResult.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
        const fileName = `${safePrompt || 'ai-mirror-space'}-${activeResult.id}.png`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [activeResult]);

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedImageIds(new Set());
    };

    const toggleImageSelection = (imageId: number) => {
        setSelectedImageIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(imageId)) {
                newSet.delete(imageId);
            } else {
                newSet.add(imageId);
            }
            return newSet;
        });
    };

    const downloadSelectedImages = async () => {
        if (selectedImageIds.size === 0) {
            alert('저장할 이미지를 선택해주세요.');
            return;
        }
        const zip = new JSZip();
        const imagesToDownload = generatedImages.filter(img => selectedImageIds.has(img.id));
        for (const image of imagesToDownload) {
            const safePrompt = image.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
            const fileName = `${safePrompt || 'ai-mirror-space'}-${image.id}.png`;
            const base64Data = image.src.split(',')[1];
            zip.file(fileName, base64Data, { base64: true });
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
    
    const downloadAllImages = async () => {
        if (generatedImages.length === 0) return;

        const zip = new JSZip();
        for (const image of generatedImages) {
            const safePrompt = image.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
            const fileName = `${safePrompt || 'ai-mirror-space'}-${image.id}.png`;
            const base64Data = image.src.split(',')[1];
            zip.file(fileName, base64Data, { base64: true });
        }
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'ai-mirror-space-all-images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    const openModal = (imageId: number) => {
        const imageIndex = generatedImages.findIndex(img => img.id === imageId);
        if (imageIndex > -1) {
            setModalImageIndex(imageIndex);
            setIsModalOpen(true);
        }
    };
    const closeModal = () => setIsModalOpen(false);
    
    const isGenerationDisabled = useMemo(() => {
        return isLoading || (!sourceImage1 && !sourceImage2 && !prompt.trim());
    }, [isLoading, sourceImage1, sourceImage2, prompt]);

    const appMode = useMemo(() => {
        if (sourceImage1 && sourceImage2) return 'recompose';
        if (sourceImage1) return 'edit';
        return 'generate';
    }, [sourceImage1, sourceImage2]);

    const promptPlaceholder = {
        generate: '상상 속 당신의 모습을 묘사해보세요...',
        edit: '이 이미지를 어떻게 바꾸고 싶으신가요?',
        recompose: '두 이미지를 어떻게 결합할까요? (예: 인물과 배경 스타일 결합)'
    }[appMode];

    const source1Title = {
        generate: '소스 1',
        edit: '편집할 이미지',
        recompose: '주요 피사체 (인물)'
    }[appMode];

    const source2Title = {
        generate: '소스 2',
        edit: '소스 2 (결합 시 사용)',
        recompose: '스타일 & 배경'
    }[appMode];

    return (
        <div className="flex flex-col min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
            <div className="container mx-auto p-4 md:p-8 flex-grow flex flex-col">
                <header className="text-center mb-12 animate-[fadeIn_0.5s_ease-out_forwards] opacity-0">
                    <h1 className="text-5xl md:text-6xl neon-title">
                        AI Mirror Space
                    </h1>
                    <p className="text-lg md:text-xl mt-4 text-[var(--text-secondary)] font-medium tracking-wide">AI 거울을 통해 새로운 나를 발견하는 공간</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
                    {/* ===== Source Panel (Left) ===== */}
                    <aside className="lg:col-span-3 flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out_forwards] opacity-0" style={{ animationDelay: '200ms' }}>
                        <NeumorphicPanel className="flex-1 flex flex-col">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{source1Title}</h2>
                            <ImageUploader onImageUpload={(file) => handleImageUpload(file, 1)} onClear={() => handleImageClear(1)} sourceImage={sourceImage1} />
                        </NeumorphicPanel>
                         <NeumorphicPanel className="flex-1 flex flex-col">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{source2Title}</h2>
                            <ImageUploader onImageUpload={(file) => handleImageUpload(file, 2)} onClear={() => handleImageClear(2)} sourceImage={sourceImage2} />
                        </NeumorphicPanel>
                    </aside>

                    {/* ===== Control Panel (Center) ===== */}
                    <section className="lg:col-span-6 space-y-6 flex flex-col animate-[fadeIn_0.5s_ease-out_forwards] opacity-0" style={{ animationDelay: '400ms' }}>
                        <NeumorphicPanel>
                             <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">1. 프롬프트 입력</h2>
                                <NeumorphicButton onClick={handleGetInspiration} title="새로운 영감 받기" className="!p-2 !rounded-full text-xl !bg-transparent">
                                    💡
                                </NeumorphicButton>
                            </div>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-24 p-4 text-base rounded-xl custom-inset focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                                placeholder={promptPlaceholder}
                            />
                        </NeumorphicPanel>

                        <NeumorphicPanel className="flex-grow flex flex-col">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">2. 스타일 선택</h2>
                            <StyleSelector styles={STYLES} selectedStyle={selectedStyle} onSelectStyle={handleStyleSelect} />
                        </NeumorphicPanel>

                        <NeumorphicPanel>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">3. 사진 비율 선택</h2>
                            <AspectRatioSelector 
                                aspectRatios={ASPECT_RATIOS} 
                                selectedAspectRatio={selectedAspectRatio} 
                                onSelectAspectRatio={handleAspectRatioSelect}
                                disabled={!!sourceImage1 || !!sourceImage2}
                            />
                        </NeumorphicPanel>

                         <NeumorphicPanel className="neon-glow-panel">
                                <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">✨ AI Magic Tools</h2>
                                <p className="text-xs text-center text-[var(--text-secondary)] mb-6">결과물에 적용하여 연속적으로 수정할 수 있습니다.</p>
                                <PostProcessingControls onModify={handleGenerate} disabled={isLoading || (!activeResult && !sourceImage1)} />
                         </NeumorphicPanel>
                        
                         <div className="pt-2">
                             <button
                                onClick={() => handleGenerate()}
                                disabled={isGenerationDisabled}
                                className="main-generate-button w-full rounded-full py-4 px-10 text-xl font-bold text-white bg-[var(--accent-color)] transition-all duration-300 ease-in-out shadow-lg hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--text-tertiary)] disabled:shadow-none"
                            >
                                {isLoading ? '생성 중...' : '발견하기'}
                            </button>
                        </div>
                    </section>

                    {/* ===== Result Viewer Panel (Right) ===== */}
                    <aside className="lg:col-span-3 flex flex-col animate-[fadeIn_0.5s_ease-out_forwards] opacity-0" style={{ animationDelay: '600ms' }}>
                         <NeumorphicPanel className="h-full flex flex-col">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">결과물</h2>
                            <ResultViewer image={activeResult} isLoading={isLoading} error={error} onDownload={handleDownloadActiveImage}/>
                        </NeumorphicPanel>
                    </aside>
                </main>
                
                {generatedImages.length > 0 && (
                    <section className="mt-12 animate-[fadeIn_1s_ease-out]">
                        <NeumorphicPanel>
                             <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">라이브러리 앨범</h2>
                                <div className="flex items-center space-x-2">
                                    {isSelectionMode ? (
                                        <>
                                            <span className="text-sm font-semibold text-[var(--text-secondary)] mr-2">{selectedImageIds.size}개 선택됨</span>
                                            <NeumorphicButton onClick={downloadSelectedImages} className="!px-3 !py-2 text-sm" disabled={selectedImageIds.size === 0}>선택 다운로드</NeumorphicButton>
                                            <NeumorphicButton onClick={toggleSelectionMode} className="!px-3 !py-2 text-sm">취소</NeumorphicButton>
                                        </>
                                    ) : (
                                        <>
                                            <NeumorphicButton onClick={downloadAllImages} className="!px-3 !py-2 text-sm">전체 다운로드</NeumorphicButton>
                                            <NeumorphicButton onClick={toggleSelectionMode} className="!px-3 !py-2 text-sm">선택</NeumorphicButton>
                                        </>
                                    )}
                                </div>
                            </div>
                            <ImageGallery 
                                images={generatedImages} 
                                onImageClick={isSelectionMode ? toggleImageSelection : openModal}
                                isSelectionMode={isSelectionMode}
                                selectedImageIds={selectedImageIds}
                            />
                        </NeumorphicPanel>
                    </section>
                )}
            </div>

            {isModalOpen && modalImageIndex !== null && (
                 <GalleryModal
                    images={generatedImages}
                    startIndex={modalImageIndex}
                    onClose={closeModal}
                />
            )}
            
            <div className="text-center py-12 px-4 mt-8">
                <blockquote className="max-w-3xl mx-auto text-lg text-[var(--text-secondary)] italic">
                    <p>"거울은 현재의 나를 보여주지만, 아바타는 가능성의 나를 보여줍니다.<br />AI 거울 속에서, 당신의 무한한 자아를 탐색하세요."</p>
                </blockquote>
            </div>

            <footer className="text-center py-8 text-[var(--text-tertiary)] text-base">
                <p className="font-semibold"><span className="neon-text-subtle">© Created by Demian 임정훈</span></p>
            </footer>
        </div>
    );
};

export default App;
