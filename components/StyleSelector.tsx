
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
        <div className="grid grid-cols-3 gap-5 flex-grow">
            {styles.map((style) => (
                <NeumorphicButton
                    key={style.id}
                    onClick={() => onSelectStyle(style.id)}
                    isSelected={selectedStyle === style.id}
                    className="flex-col space-y-2 aspect-square"
                >
                    <span className="text-5xl">{style.icon}</span>
                    <span className="text-base font-semibold text-center">{style.name}</span>
                </NeumorphicButton>
            ))}
        </div>
    );
};
