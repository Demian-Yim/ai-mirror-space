import React, { useState, useEffect } from 'react';
import { NeumorphicButton } from './NeumorphicButton';

interface TutorialModalProps {
    onClose: () => void;
}

const steps = [
    {
        title: "Demian's Universe에 오신 것을 환영합니다",
        content: "반갑습니다. 이곳은 단순한 이미지 생성기가 아닙니다. 당신의 내면을 탐구하고 무한한 가능성을 시각화하는 '페르소나 넥서스'입니다. Demian 임정훈이 설계한 이 공간에서 새로운 자아를 발견하는 여정을 시작해보세요.",
        icon: "🌌"
    },
    {
        title: "Image Galaxy: 자아 탐구의 시작",
        content: "좌측 '메인 소스'에 당신의 사진을 올려주세요. '스타일 & 배경'에 다른 이미지를 추가하면, 두 자아를 결합하는 '페르소나 믹서'가 활성화됩니다. 이미지가 없다면 텍스트만으로 상상 속의 나를 그려낼 수도 있습니다.",
        icon: "🎨"
    },
    {
        title: "Video Universe: 생명을 불어넣다",
        content: "중앙 상단의 모드를 'Video Universe'로 전환해보세요. 정지된 페르소나에 움직임을 부여할 수 있습니다. Veo 엔진이 당신의 상상을 생동감 넘치는 영상으로 구현합니다.",
        icon: "🪐"
    },
    {
        title: "Magic Tools & Library: 완성",
        content: "결과물이 마음에 드시나요? 'Magic Tools'로 표정을 미세하게 조정하거나 나이를 변화시켜보세요. 완성된 모든 작품은 '갤러리'에 안전하게 보관됩니다.",
        icon: "💎"
    }
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.3s]">
            <div className="bg-[var(--panel-bg-solid)] p-8 rounded-2xl shadow-2xl max-w-lg w-[90%] border border-[var(--border-color)] relative transition-colors duration-300">
                <div className="text-center mb-8">
                    <div className="text-7xl mb-6 animate-[fadeInScale_0.5s] filter drop-shadow-md">{steps[currentStep].icon}</div>
                    <h2 className="text-2xl font-bold font-serif mb-3 text-[var(--text-primary)]">{steps[currentStep].title}</h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-sm md:text-base break-keep">
                        {steps[currentStep].content}
                    </p>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-[var(--border-color)]">
                    <div className="flex gap-2">
                        {steps.map((_, idx) => (
                            <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-[var(--accent-warm)] w-8' : 'bg-[var(--border-color)] w-2'}`}></div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                         <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                            건너뛰기 (Skip)
                        </button>
                        <button 
                            onClick={handleNext} 
                            className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold shadow-md hover:bg-[var(--accent-hover)] hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            {currentStep === steps.length - 1 ? '여정 시작하기' : '다음'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};