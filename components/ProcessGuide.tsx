import React from 'react';

export const ProcessGuide: React.FC = () => {
    return (
        <div className="w-full max-w-5xl mx-auto mb-6 px-4 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row items-center justify-between bg-[var(--panel-bg)] backdrop-blur-md rounded-2xl p-5 border border-[var(--border-color)] shadow-sm relative overflow-hidden">
                {/* Decorative Background Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-warm)] to-[var(--accent-cool)] opacity-50"></div>
                
                {/* Step 1 */}
                <div className="flex items-center gap-4 mb-4 md:mb-0 z-10 w-full md:w-auto p-2 rounded-xl hover:bg-[var(--inset-bg)] transition-colors cursor-default group">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-2xl shadow-sm border border-[var(--border-color)] group-hover:scale-110 transition-transform">
                        📂
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">STEP 1. 소스 업로드</h4>
                        <p className="text-xs text-[var(--text-secondary)]">나의 사진을 선택하세요</p>
                    </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:block text-[var(--accent-primary)] opacity-50 transform translate-y-[-2px]">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4 mb-4 md:mb-0 z-10 w-full md:w-auto p-2 rounded-xl hover:bg-[var(--inset-bg)] transition-colors cursor-default group">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-2xl shadow-sm border border-[var(--border-color)] group-hover:scale-110 transition-transform">
                        🎨
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">STEP 2. 스타일 & 조율</h4>
                        <p className="text-xs text-[var(--text-secondary)]">원하는 페르소나를 설계하세요</p>
                    </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:block text-[var(--accent-primary)] opacity-50 transform translate-y-[-2px]">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4 z-10 w-full md:w-auto p-2 rounded-xl hover:bg-[var(--inset-bg)] transition-colors cursor-default group">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-2xl shadow-sm border border-[var(--border-color)] group-hover:scale-110 transition-transform">
                        ✨
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">STEP 3. 발견 & 확장</h4>
                        <p className="text-xs text-[var(--text-secondary)]">새로운 자아를 만나보세요</p>
                    </div>
                </div>
            </div>
        </div>
    );
};