export interface QueryRequest {
  query: string;
}

export interface QueryResponse {
  llmResponse: string;
  updatedSummary: string;
}

export interface FileIngestionRequest {
  urls: string[];
}

export interface FileIngestionResponse {
  status: string;
  message: string;
  processedUrls: string[];
}
