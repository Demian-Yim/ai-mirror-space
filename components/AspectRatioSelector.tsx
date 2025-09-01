import React from 'react';
import type { AspectRatio } from '../types';
import { NeumorphicButton } from './NeumorphicButton';

interface AspectRatioSelectorProps {
    aspectRatios: AspectRatio[];
    selectedAspectRatio: string;
    onSelectAspectRatio: (aspectRatioId: AspectRatio['id']) => void;
    disabled: boolean;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ 
    aspectRatios, 
    selectedAspectRatio, 
    onSelectAspectRatio, 
    disabled 
}) => {
    return (
        <div className={`transition-opacity duration-300 ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <div className={`grid grid-cols-3 gap-3 flex-grow ${disabled ? 'pointer-events-none' : ''}`}>
                {aspectRatios.map((ratio) => (
                    <NeumorphicButton
                        key={ratio.id}
                        onClick={() => onSelectAspectRatio(ratio.id)}
                        isSelected={selectedAspectRatio === ratio.id}
                        className="flex-col !p-2 space-y-1 text-xs h-20"
                        title={ratio.name}
                        disabled={disabled}
                    >
                        <span className="text-3xl font-mono">{ratio.icon}</span>
                        <span className="font-semibold">{ratio.name}</span>
                    </NeumorphicButton>
                ))}
            </div>
            {disabled && (
                 <p className="text-xs text-center text-gray-500 mt-3">
                    이미지 생성 시에만 비율 선택이 가능합니다.
                </p>
            )}
        </div>
    );
};
