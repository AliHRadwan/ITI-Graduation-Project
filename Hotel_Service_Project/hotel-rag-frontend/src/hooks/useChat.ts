import { useState, useEffect, useCallback } from 'react';
import { Message } from '../types/chat';
import { askQuestion } from '../services/api';
import { saveMessages, loadMessages, clearMessages as clearStoredMessages } from '../utils/storage';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    const loaded = loadMessages();
    setMessages(loaded);
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  const sendMessage = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Add loading placeholder for assistant
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await askQuestion({ question, top_k: 5 });

      // Replace loading message with actual response
      setMessages(prev => {
        const withoutLoading = prev.filter(m => !m.isLoading);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.answer,
          timestamp: new Date(),
          sources: response.sources,
        };
        return [...withoutLoading, assistantMessage];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Replace loading message with error message
      setMessages(prev => {
        const withoutLoading = prev.filter(m => !m.isLoading);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please make sure the backend server is running and try again.',
          timestamp: new Date(),
        };
        return [...withoutLoading, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    clearStoredMessages();
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}

