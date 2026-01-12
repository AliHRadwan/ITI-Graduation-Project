import { Message as MessageType } from '../types/chat';
import LoadingIndicator from './LoadingIndicator';
import SourceCard from './SourceCard';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          {message.isLoading ? (
            <LoadingIndicator />
          ) : (
            <div className="text-sm md:text-base whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-gray-600 font-medium mb-2">Sources:</div>
            {message.sources.map((source, index) => (
              <SourceCard key={index} source={source} />
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-1 px-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

