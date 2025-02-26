export interface QueryRequest {
  query: string;
  chatId: string;
}

export interface QueryResponse {
  llmResponse: string;
  updatedSummary: string;
}

export interface LlmServiceResponse {
  answer: string;
}

export interface FileIngestionRequest {
  urls: string[];
}

export interface FileIngestionResponse {
  status: string;
  processedUrls: string[];
}
