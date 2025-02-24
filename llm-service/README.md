# LLM Service Mock

This is a mock service that simulates an LLM and file management system. It provides two main endpoints for handling chat queries and file ingestion.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm run dev  # for development with hot reload
# or
npm start    # for production
```

The server will run on port 3002 by default.

## API Endpoints

### 1. Query Endpoint

- **URL:** `/api/query`
- **Method:** POST
- **Content-Type:** application/json
- **Request Body:**
  ```json
  {
    "query": "string",
    "conversationSummary": "string"
  }
  ```
- **Response:**
  ```json
  {
    "llmResponse": "string",
    "updatedSummary": "string"
  }
  ```

### 2. File Management Endpoint

- **URL:** `/api/ingest-files`
- **Method:** POST
- **Content-Type:** application/json
- **Request Body:**
  ```json
  {
    "urls": ["string"]
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "string",
    "processedUrls": ["string"]
  }
  ```

## Error Handling

Both endpoints will return a 400 status code with an error message if the required fields are missing or invalid.
