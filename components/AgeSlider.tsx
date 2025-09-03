

import React, { useState, useEffect, useRef } from 'react';

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

interface AgeSliderProps {
    onModify: (prompt: string, age?: number) => void;
    disabled: boolean;
}

export const AgeSlider: React.FC<AgeSliderProps> = ({ onModify, disabled }) => {
    const [ageValue, setAgeValue] = useState(0);
    const debouncedAgeValue = useDebounce(ageValue, 500); // 500ms delay
    const lastTriggeredAgeValue = useRef<number | null>(null);
    
    const onModifyRef = useRef(onModify);
    useEffect(() => {
        onModifyRef.current = onModify;
    }, [onModify]);

    // Effect to trigger modification when debounced value changes
    useEffect(() => {
        // Only call onModify if the debounced value is not 0 and is different from the last value that triggered the call.
        if (debouncedAgeValue !== 0 && debouncedAgeValue !== lastTriggeredAgeValue.current) {
            onModifyRef.current('', debouncedAgeValue);
            lastTriggeredAgeValue.current = debouncedAgeValue;
        }

        // If the slider is moved back to 0, reset the ref to allow triggering again.
        if (debouncedAgeValue === 0) {
            lastTriggeredAgeValue.current = null;
        }
    }, [debouncedAgeValue]);

    return (
        <div>
            <h4 className="font-semibold text-center mb-2 text-[var(--text-secondary)] uppercase text-xs tracking-wider">AGE</h4>
            <div className="text-center mb-1">
                 <span className="text-base font-bold text-[var(--accent-color)]">
                    {ageValue > 0 ? `+${ageValue}` : ageValue}
                 </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">어리게</span>
                <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={ageValue}
                    onChange={(e) => setAgeValue(Number(e.target.value))}
                    disabled={disabled}
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">성숙하게</span>
            </div>
        </div>
    );
};