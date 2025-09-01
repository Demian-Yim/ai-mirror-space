import React from 'react';

interface NeumorphicPanelProps {
    children: React.ReactNode;
    className?: string;
}

export const NeumorphicPanel: React.FC<NeumorphicPanelProps> = ({ children, className = '' }) => {
    return (
        <div className={`
            p-6 rounded-2xl 
            bg-[var(--panel-bg)]
            border border-[var(--border-color)]
            backdrop-blur-sm
            ${className}
        `}>
            {children}
        </div>
    );
};