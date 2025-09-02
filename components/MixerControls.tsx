import React from 'react';
import { NeumorphicPanel } from './NeumorphicPanel';

interface MixerValues {
    identityPreservation: number;
    styleMix: number;
    backgroundMix: number;
}

interface MixerControlsProps {
    values: MixerValues;
    onChange: (newValues: MixerValues) => void;
}

const Slider: React.FC<{
    label: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    minLabel: string;
    maxLabel: string;
}> = ({ label, value, onChange, minLabel, maxLabel }) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between">
            <label className="text-base font-semibold text-[var(--text-primary)]">{label}</label>
            <span className="text-lg font-bold text-[var(--accent-color)] w-16 text-center">{value}%</span>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-[var(--text-secondary)] w-12 text-center">{minLabel}</span>
            <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={value}
                onChange={onChange}
            />
            <span className="text-xs font-bold text-[var(--text-secondary)] w-12 text-center">{maxLabel}</span>
        </div>
    </div>
);

export const MixerControls: React.FC<MixerControlsProps> = ({ values, onChange }) => {
    const handleChange = (field: keyof MixerValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...values, [field]: Number(e.target.value) });
    };

    return (
        <NeumorphicPanel className="neon-glow-panel">
            <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">🤖 AI 페르소나 믹서</h2>
            <p className="text-xs text-center text-[var(--text-secondary)] mb-6">슬라이더를 조절하여 두 이미지의 요소를 혼합하세요.</p>
            <div className="space-y-6">
                <Slider
                    label="피사체 정체성 보존"
                    value={values.identityPreservation}
                    onChange={handleChange('identityPreservation')}
                    minLabel="약하게"
                    maxLabel="강하게"
                />
                <Slider
                    label="스타일 믹스"
                    value={values.styleMix}
                    onChange={handleChange('styleMix')}
                    minLabel="소스 1"
                    maxLabel="소스 2"
                />
                <Slider
                    label="배경 믹스"
                    value={values.backgroundMix}
                    onChange={handleChange('backgroundMix')}
                    minLabel="소스 1"
                    maxLabel="소스 2"
                />
            </div>
        </NeumorphicPanel>
    );
};
