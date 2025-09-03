

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
            <div className={`grid grid-cols-3 gap-2 flex-grow ${disabled ? 'pointer-events-none' : ''}`}>
                {aspectRatios.map((ratio) => (
                    <NeumorphicButton
                        key={ratio.id}
                        onClick={() => onSelectAspectRatio(ratio.id)}
                        isSelected={selectedAspectRatio === ratio.id}
                        className="flex-col !p-1 space-y-1 justify-center h-16"
                        title={ratio.name}
                        disabled={disabled}
                    >
                        <span className="text-2xl">{ratio.icon}</span>
                        <span className="text-xs font-semibold">{ratio.name}</span>
                    </NeumorphicButton>
                ))}
            </div>
        </div>
    );
};