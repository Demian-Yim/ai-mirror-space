import React from 'react';

interface NeumorphicButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    isSelected?: boolean;
    disabled?: boolean;
    className?: string;
    title?: string;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
    onClick,
    children,
    isSelected = false,
    disabled = false,
    className = '',
    title
}) => {
    const baseClasses = 'p-3 text-base transition-all duration-200 ease-in-out rounded-xl flex items-center justify-center border';
    const stateClasses = isSelected
        ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-md shadow-[var(--accent-color)]/20'
        : 'bg-[var(--panel-bg-solid)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--accent-color-hover)] hover:text-[var(--accent-color-hover)]';
    const disabledClasses = 'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--border-color)] disabled:hover:text-[var(--text-primary)]';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
            title={title}
        >
            {children}
        </button>
    );
};