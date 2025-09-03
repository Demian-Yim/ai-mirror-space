

import React from 'react';
import { NeumorphicButton } from './NeumorphicButton';
import { POST_PROCESSING_PROMPTS } from '../constants';
import { AgeSlider } from './AgeSlider';

interface PostProcessingControlsProps {
    onModify: (prompt: string, age?: number) => void;
    disabled: boolean;
}

const enhancementButtons = [
    { key: 'upscale', label: '업스케일', icon: '💎' },
    { key: 'pretty', label: '예쁘게', icon: '✨' },
    { key: 'cool', label: '멋지게', icon: '🔥' },
];

const expressionButtons = [
    { key: 'joy', label: '기쁨', icon: '😊' },
    { key: 'sadness', label: '슬픔', icon: '😢' },
    { key: 'anger', label: '짜증', icon: '😠' },
    { key: 'neutral', label: '중립', icon: '😐' },
];

export const PostProcessingControls: React.FC<PostProcessingControlsProps> = ({ onModify, disabled }) => {

    return (
        <div className="flex flex-col h-full">
            <div className="space-y-2">
                <div>
                    <h4 className="font-semibold text-center mb-1 text-[var(--text-secondary)] uppercase text-xs tracking-wider">Enhance</h4>
                    <div className="grid grid-cols-3 gap-1.5">
                        {enhancementButtons.map(btn => (
                            <NeumorphicButton
                                key={btn.key}
                                onClick={() => onModify(POST_PROCESSING_PROMPTS[btn.key])}
                                disabled={disabled}
                                className="flex-col !p-1 space-y-0.5 h-12"
                                title={btn.label}
                            >
                                <span className="text-lg">{btn.icon}</span>
                                <span className="font-semibold text-[10px]">{btn.label}</span>
                            </NeumorphicButton>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-center mb-1 text-[var(--text-secondary)] uppercase text-xs tracking-wider">Expression</h4>
                     <div className="grid grid-cols-4 gap-1.5">
                        {expressionButtons.map(btn => (
                            <NeumorphicButton
                                key={btn.key}
                                onClick={() => onModify(POST_PROCESSING_PROMPTS[btn.key])}
                                disabled={disabled}
                                className="flex-col aspect-square !p-1 !rounded-xl justify-center space-y-0.5"
                                title={btn.label}
                            >
                                <span className="text-base">{btn.icon}</span>
                                <span className="text-[10px] font-semibold">{btn.label}</span>
                            </NeumorphicButton>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-2">
                <div className="border-t border-[var(--border-color)] mb-2"></div>
                <AgeSlider onModify={onModify} disabled={disabled} />
            </div>
        </div>
    );
};