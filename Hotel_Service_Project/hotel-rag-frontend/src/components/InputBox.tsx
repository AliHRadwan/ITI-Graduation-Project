import { useState, KeyboardEvent } from 'react';

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function InputBox({ onSend, disabled }: InputBoxProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about the hotel..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          style={{ minHeight: '52px', maxHeight: '150px' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}

