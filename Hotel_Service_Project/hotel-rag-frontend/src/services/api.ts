import axios from 'axios';
import { AskRequest, AskResponse } from '../types/chat';

const API_BASE_URL = 'http://127.0.0.1:8002';

export async function askQuestion(request: AskRequest): Promise<AskResponse> {
  const response = await axios.post<AskResponse>(`${API_BASE_URL}/ask`, {
    question: request.question,
    top_k: request.top_k || 5,
    category: request.category || null,
    doc_collection: request.doc_collection || null,
  });
  return response.data;
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await axios.get(`${API_BASE_URL}/health`);
  return response.data;
}

