import { Message } from '../types/chat';

const STORAGE_KEY = 'hotel-rag-chat-history';
const MAX_MESSAGES = 50;

export function saveMessages(messages: Message[]): void {
  try {
    // Keep only the latest MAX_MESSAGES
    const messagesToSave = messages.slice(-MAX_MESSAGES);
    
    // Convert to JSON-safe format (Date to string)
    const serialized = messagesToSave.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
}

export function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Convert timestamp strings back to Date objects
    return parsed.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
    return [];
  }
}

export function clearMessages(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear messages from localStorage:', error);
  }
}

