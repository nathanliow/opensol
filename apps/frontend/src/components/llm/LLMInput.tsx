import { useState, useCallback } from 'react';
import { useConfig } from '../../contexts/ConfigContext';

interface LLMInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export const LLMInput = ({ onSubmit, disabled }: LLMInputProps) => {
  const [prompt, setPrompt] = useState('');
  const { apiKeys } = useConfig();
  const hasOpenAIKey = Boolean(apiKeys['openai']);

  const handleSubmit = useCallback(() => {
    if (prompt.trim()) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  }, [prompt, onSubmit]);

  return (
    <div className="flex gap-2 p-4">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={hasOpenAIKey ? "Ask AI to help modify your flow..." : "Please add OpenAI API key in settings..."}
        disabled={disabled || !hasOpenAIKey}
        className="flex-1 px-4 py-2 bg-[#2D2D2D] text-white rounded-full border border-[#333333] focus:outline-none focus:border-[#4B5563] disabled:opacity-50 disabled:cursor-not-allowed"
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !hasOpenAIKey || !prompt.trim()}
        className="px-4 py-2 bg-[#2D2D2D] text-white rounded-full border border-[#333333] hover:bg-[#3D3D3D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </div>
  );
};