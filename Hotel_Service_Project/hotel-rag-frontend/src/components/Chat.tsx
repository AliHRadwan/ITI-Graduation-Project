import { useChat } from '../hooks/useChat';
import Header from './Header';
import MessageList from './MessageList';
import InputBox from './InputBox';
import ExampleQuestions from './ExampleQuestions';

export default function Chat() {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      clearMessages();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header onClearChat={handleClearChat} hasMessages={messages.length > 0} />

      {messages.length === 0 ? (
        <ExampleQuestions onSelectQuestion={sendMessage} />
      ) : (
        <MessageList messages={messages} />
      )}

      <InputBox onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}

