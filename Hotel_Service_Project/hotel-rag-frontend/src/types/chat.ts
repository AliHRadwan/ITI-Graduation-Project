// Chat types for the Hotel RAG frontend
export interface Source {
  doc_collection: string;
  source_file: string;
  section_title: string | null;
  category: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
  isLoading?: boolean;
}

export interface AskRequest {
  question: string;
  top_k?: number;
  category?: string | null;
  doc_collection?: string | null;
}

export interface AskResponse {
  answer: string;
  sources: Source[];
  debug: {
    retrieved: Array<{
      distance: number;
      content_preview: string;
      metadata: Record<string, any>;
    }>;
  };
}

