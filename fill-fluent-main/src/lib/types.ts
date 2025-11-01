export interface UploadResponse {
  document_id: string;
  status: string;
}

export interface ChatFill {
  unique_id: string;
  field: string;
  value: string;
}

export interface ChatResponse {
  status: string;
  question?: string;
  message: string;
  fills?: ChatFill[];
}

export interface PlaceholderSummary {
  total_placeholders: number;
  filled_count: number;
  unfilled_count: number;
  completion_percentage: number;
}

export interface Placeholder {
  unique_id: string;
  match: string;
  match_type: string;
  is_filled: boolean;
  value: string | null;
  llm_context: string;
  context_snippet: string;
  sentence_with_match: string;
  paragraph_index: number;
  estimated_page_number: number;
  fill_confidence: string | null;
}

export interface PlaceholdersResponse {
  status: string;
  summary: PlaceholderSummary;
  placeholders: Placeholder[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fills?: ChatFill[];
  timestamp: Date;
}
