import React, { useState } from 'react';

interface TutorialModalProps {
    onClose: () => void;
}

const steps = [
    {
        title: "Demian's AI Mirror Universe",
        subtitle: "거울 속의 무한한 나를 발견하는 여정",
        content: "반갑습니다, 탐험가님. 이곳은 Demian 임정훈이 설계한 '페르소나 넥서스'입니다. 단순한 이미지 생성을 넘어, 당신의 내면에 숨겨진 다양한 자아를 시각화하고 탐구하는 공간입니다. 시작하기 전, 간단한 안내를 도와드릴게요.",
        icon: "🌌"
    },
    {
        title: "Image Galaxy: 자아 탐구",
        subtitle: "나의 모습과 스타일의 결합",
        content: "왼쪽 '메인 소스'에 당신의 사진을 올려주세요. '스타일 & 배경'에 다른 이미지를 추가하면 두 세계가 결합되는 '페르소나 믹서'가 작동합니다. 혹은 아무것도 올리지 않고 텍스트만으로 상상 속의 나를 그려낼 수도 있습니다.",
        icon: "🎨"
    },
    {
        title: "Video Universe: 생명의 숨결",
        subtitle: "정지된 순간에 움직임을",
        content: "상단의 모드를 'Video Universe'로 전환해보세요. 당신의 페르소나 사진 한 장이면 충분합니다. '손을 흔들며 미소 짓기'와 같은 명령어로 정지된 시간에 생명을 불어넣을 수 있습니다.",
        icon: "🪐"
    },
    {
        title: "Magic Tools: 디테일의 완성",
        subtitle: "섬세한 감정의 조율",
        content: "결과물이 나왔다면 멈추지 마세요. 중앙 하단의 'Magic Tools'를 사용해 표정을 바꾸거나, -50세부터 +50세까지 나이를 조절하며 페르소나의 서사를 완성해 보세요.",
        icon: "✨"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-[fadeIn_0.3s]">
            <div className="bg-[var(--panel-bg-solid)] p-8 rounded-3xl shadow-2xl max-w-lg w-[90%] border border-[var(--border-color)] relative transition-all duration-300 transform scale-100 overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--accent-primary)] rounded-full blur-3xl opacity-20"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--accent-warm)] rounded-full blur-3xl opacity-20"></div>

                <div className="text-center mb-8 relative z-10">
                    <div className="text-7xl mb-6 animate-[fadeInScale_0.5s] filter drop-shadow-lg inline-block p-4 rounded-full bg-[var(--inset-bg)]">
                        {steps[currentStep].icon}
                    </div>
                    <h2 className="text-2xl font-bold font-serif mb-1 text-[var(--text-primary)]">{steps[currentStep].title}</h2>
                    <h3 className="text-sm font-medium text-[var(--accent-primary)] mb-4 tracking-wide uppercase">{steps[currentStep].subtitle}</h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-sm md:text-base break-keep font-light">
                        {steps[currentStep].content}
                    </p>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-[var(--border-color)] relative z-10">
                    <div className="flex gap-2">
                        {steps.map((_, idx) => (
                            <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentStep ? 'bg-[var(--accent-warm)] w-8' : 'bg-[var(--border-color)] w-2'}`}></div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                         <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                            건너뛰기 (Skip)
                        </button>
                        <button 
                            onClick={handleNext} 
                            className="px-6 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-main)] font-bold shadow-md hover:opacity-90 transition-all transform hover:-translate-y-0.5 text-sm"
                        >
                            {currentStep === steps.length - 1 ? '여정 시작하기' : '다음'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};