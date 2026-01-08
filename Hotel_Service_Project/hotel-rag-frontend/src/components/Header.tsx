interface HeaderProps {
  onClearChat: () => void;
  hasMessages: boolean;
}

export default function Header({ onClearChat, hasMessages }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold text-gray-900">Hotel Assistant</div>
          <div className="hidden sm:block text-sm text-gray-500">Powered by RAG</div>
        </div>
        {hasMessages && (
          <button
            onClick={onClearChat}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Clear Chat
          </button>
        )}
      </div>
    </header>
  );
}

