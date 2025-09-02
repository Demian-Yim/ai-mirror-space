import React, { useState } from 'react';
import { NeumorphicPanel } from './NeumorphicPanel';

interface ApiKeyModalProps {
    onSubmit: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSubmit }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onSubmit(apiKey.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <NeumorphicPanel className="w-full max-w-lg mx-4 animate-[fadeInScale_0.3s_ease-out]">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold text-center mb-2 neon-text-subtle">환영합니다!</h2>
                    <p className="text-center text-[var(--text-secondary)] mb-6">AI Mirror Universe를 사용하려면 Google Gemini API 키가 필요합니다.</p>
                    
                    <div className="space-y-2 mb-6">
                        <label htmlFor="apiKey" className="block text-sm font-medium text-[var(--text-primary)]">
                            Google Gemini API 키
                        </label>
                        <input
                            id="apiKey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full p-3 text-base rounded-xl custom-inset focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                            placeholder="AIzaSy..."
                            required
                        />
                         <p className="text-xs text-[var(--text-tertiary)] pt-1">
                            API 키는 당신의 브라우저에만 저장되며, 다른 곳으로 전송되지 않습니다.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                         <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full text-center rounded-full py-3 px-6 text-base font-bold text-white bg-[var(--panel-bg-solid)] border border-[var(--border-color)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                        >
                            API 키 발급받기
                        </a>
                        <button 
                            type="submit"
                            className="w-full rounded-full py-3 px-6 text-base font-bold text-white bg-[var(--accent-color)] transition-all duration-300 ease-in-out shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed main-generate-button"
                            disabled={!apiKey.trim()}
                        >
                            저장하고 시작하기
                        </button>
                    </div>
                </form>
            </NeumorphicPanel>
        </div>
    );
};
