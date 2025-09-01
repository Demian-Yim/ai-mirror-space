import React, { useState, useEffect, useCallback } from 'react';
import { NeumorphicButton } from './NeumorphicButton';
import { POST_PROCESSING_PROMPTS } from '../constants';

// Simple debounce function
function useDebounce(value: number, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

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
    const [ageValue, setAgeValue] = useState(0);
    const debouncedAgeValue = useDebounce(ageValue, 500); // 500ms delay

    // Effect to trigger modification when debounced value changes
    useEffect(() => {
        if (debouncedAgeValue !== 0) {
            onModify('', debouncedAgeValue);
        }
         // Reset internal state if the slider goes back to 0 to avoid re-triggering
        if (debouncedAgeValue === 0 && ageValue !== 0) {
           // This effect is mainly for triggering, no reset logic needed here
           // as the parent component's `onModify` handles the logic.
        }
    }, [debouncedAgeValue, onModify]);


    return (
        <div className="space-y-8">
            <div>
                <h4 className="font-semibold text-center mb-4 text-[var(--text-secondary)] uppercase text-sm tracking-wider">Enhance</h4>
                <div className="grid grid-cols-3 gap-4">
                    {enhancementButtons.map(btn => (
                        <NeumorphicButton
                            key={btn.key}
                            onClick={() => onModify(POST_PROCESSING_PROMPTS[btn.key])}
                            disabled={disabled}
                            className="flex-col !p-4 space-y-3 h-32"
                            title={btn.label}
                        >
                            <span className="text-6xl">{btn.icon}</span>
                            <span className="font-semibold text-lg">{btn.label}</span>
                        </NeumorphicButton>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-center mb-4 text-[var(--text-secondary)] uppercase text-sm tracking-wider">Expression</h4>
                 <div className="grid grid-cols-4 gap-3">
                    {expressionButtons.map(btn => (
                        <NeumorphicButton
                            key={btn.key}
                            onClick={() => onModify(POST_PROCESSING_PROMPTS[btn.key])}
                            disabled={disabled}
                            className="flex-col aspect-square !rounded-2xl justify-center space-y-2"
                            title={btn.label}
                        >
                            <span className="text-5xl">{btn.icon}</span>
                            <span className="text-base font-semibold">{btn.label}</span>
                        </NeumorphicButton>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-center mb-4 text-[var(--text-secondary)] uppercase text-sm tracking-wider">Age</h4>
                <div className="bg-[var(--panel-bg-solid)] p-4 rounded-xl border border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-3">
                         <span className="text-lg font-semibold text-[var(--text-primary)]">나이 조절</span>
                         <span className="text-2xl font-bold text-[var(--accent-color)] w-16 text-center">
                            {ageValue > 0 ? `+${ageValue}` : ageValue}
                         </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-base font-bold text-[var(--text-primary)]">어리게</span>
                        <input
                            type="range"
                            min="-50"
                            max="50"
                            step="1"
                            value={ageValue}
                            onChange={(e) => setAgeValue(Number(e.target.value))}
                            disabled={disabled}
                        />
                        <span className="text-base font-bold text-[var(--text-primary)]">성숙하게</span>
                    </div>
                </div>
            </div>
        </div>
    );
};