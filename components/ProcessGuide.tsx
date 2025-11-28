import React from 'react';

export const ProcessGuide: React.FC = () => {
    return (
        <div className="w-full max-w-6xl mx-auto mb-6 px-4 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row items-center justify-between bg-[var(--panel-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)] shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                {/* Decorative Background Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-warm)] to-[var(--accent-cool)] opacity-70"></div>
                
                {/* Step 1 */}
                <div className="flex-1 flex items-center gap-4 mb-4 md:mb-0 z-10 w-full md:w-auto p-3 rounded-xl hover:bg-[var(--inset-bg)] transition-colors cursor-default">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-3xl shadow-md border border-[var(--border-color)] text-[var(--accent-primary)] font-serif z-10 relative">
                            1
                        </div>
                        <div className="absolute inset-0 rounded-full bg-[var(--accent-primary)] opacity-20 blur-md transform scale-110"></div>
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">Upload & Select</h4>
                        <p className="text-xs text-[var(--text-secondary)] leading-tight">사진을 업로드하거나<br/>두 이미지를 믹스하세요</p>
                    </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex flex-col items-center justify-center text-[var(--accent-primary)] opacity-40 px-4">
                     <span className="text-2xl">→</span>
                </div>

                {/* Step 2 */}
                <div className="flex-1 flex items-center gap-4 mb-4 md:mb-0 z-10 w-full md:w-auto p-3 rounded-xl hover:bg-[var(--inset-bg)] transition-colors cursor-default">
                     <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-3xl shadow-md border border-[var(--border-color)] text-[var(--accent-warm)] font-serif z-10 relative">
                            2
                        </div>
                        <div className="absolute inset-0 rounded-full bg-[var(--accent-warm)] opacity-20 blur-md transform scale-110"></div>
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">Prompt & Style</h4>
                        <p className="text-xs text-[var(--text-secondary)] leading-tight">상상하는 모습을 글로 적고<br/>스타일을 선택하세요</p>
                    </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex flex-col items-center justify-center text-[var(--accent-warm)] opacity-40 px-4">
                     <span className="text-2xl">→</span>
                </div>

                {/* Step 3 */}
                <div className="flex-1 flex items-center gap-4 z-10 w-full md:w-auto p-3 rounded-xl hover:bg-[var(--inset-bg)] transition-colors cursor-default">
                     <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-3xl shadow-md border border-[var(--border-color)] text-[var(--accent-cool)] font-serif z-10 relative">
                            3
                        </div>
                        <div className="absolute inset-0 rounded-full bg-[var(--accent-cool)] opacity-20 blur-md transform scale-110"></div>
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">Generate & Discover</h4>
                        <p className="text-xs text-[var(--text-secondary)] leading-tight">Demian의 AI가<br/>새로운 자아를 창조합니다</p>
                    </div>
                </div>
            </div>
        </div>
    );
};