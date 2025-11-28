
import React from 'react';

interface NeumorphicPanelProps {
    children: React.ReactNode;
    className?: string;
}

export const NeumorphicPanel: React.FC<NeumorphicPanelProps> = ({ children, className = '' }) => {
    return (
        <div className={`
            p-6 rounded-2xl 
            glass-panel
            ${className}
        `}>
            {children}
        </div>
    );
};
