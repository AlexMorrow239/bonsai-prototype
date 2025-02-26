export interface FileProcessingRequest {
  urls: string[];
}

export interface FileProcessingResponse {
  status: string;
  processedUrls: string[];
}

export interface RagServiceResponse {
  status: string;
  processedUrls: string[];
}
