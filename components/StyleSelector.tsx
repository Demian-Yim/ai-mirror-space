

import React from 'react';
import type { Style } from '../types';
import { NeumorphicButton } from './NeumorphicButton';

interface StyleSelectorProps {
    styles: Style[];
    selectedStyle: string | null;
    onSelectStyle: (styleId: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyle, onSelectStyle }) => {
    return (
        <div className="grid grid-cols-3 gap-2 flex-grow">
            {styles.map((style) => (
                <NeumorphicButton
                    key={style.id}
                    onClick={() => onSelectStyle(style.id)}
                    isSelected={selectedStyle === style.id}
                    className="flex-col !p-1 space-y-1 justify-center h-16"
                >
                    <span className="text-2xl">{style.icon}</span>
                    <span className="text-xs font-semibold text-center">{style.name}</span>
                </NeumorphicButton>
            ))}
        </div>
    );
};