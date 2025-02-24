const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3002; // Using 3002 assuming frontend is 3000 and backend is 3001

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock data storage
let lastSummary = "";

// Query Endpoint
app.post("/api/query", (req, res) => {
  const { query, conversationSummary } = req.body;

  // Log incoming request for debugging
  console.log("Received query request:", {
    query,
    conversationSummaryLength: conversationSummary?.length || 0,
  });

  // Check if query exists and is a string
  if (!query || typeof query !== "string") {
    return res.status(400).json({
      error: "Invalid query: must be a non-empty string",
    });
  }

  // Ensure conversationSummary is a string (empty string if not provided)
  const summary = conversationSummary || "";

  // Mock LLM response - in reality, this would call the actual LLM
  const mockResponse = `This is a mock response to your query: "${query}"`;

  // Create an updated summary by combining the old one with the new interaction
  const updatedSummary = summary
    ? `${summary}\nUser: ${query}\nAssistant: ${mockResponse}`
    : `User: ${query}\nAssistant: ${mockResponse}`;

  lastSummary = updatedSummary;

  const response = {
    llmResponse: mockResponse,
    updatedSummary: updatedSummary,
  };

  // Log response for debugging
  console.log("Sending response:", {
    responseLength: response.llmResponse.length,
    summaryLength: response.updatedSummary.length,
  });

  res.json(response);
});

// File Management Endpoint
app.post("/api/ingest-files", (req, res) => {
  const { urls } = req.body;

  // Log incoming request for debugging
  console.log("Received file ingestion request:", {
    urlCount: urls?.length || 0,
  });

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({
      error: "Missing or invalid urls array",
    });
  }

  // Mock file processing - in reality, this would download and process the files
  console.log("Processing files from URLs:", urls);

  const response = {
    status: "success",
    message: `Successfully processed ${urls.length} files`,
    processedUrls: urls,
  };

  // Log response for debugging
  console.log("Sending response:", response);

  res.json(response);
});

// Start the server
app.listen(PORT, () => {
  console.log(`LLM Service running on port ${PORT}`);
});
