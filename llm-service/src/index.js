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

  if (!query || !conversationSummary) {
    return res.status(400).json({
      error: "Missing required fields: query and conversationSummary",
    });
  }

  // Mock LLM response - in reality, this would call the actual LLM
  const mockResponse = `This is a mock response to your query: "${query}"`;

  // Create an updated summary by combining the old one with the new interaction
  const updatedSummary = `${conversationSummary}\nUser: ${query}\nAssistant: ${mockResponse}`;
  lastSummary = updatedSummary;

  res.json({
    llmResponse: mockResponse,
    updatedSummary: updatedSummary,
  });
});

// File Management Endpoint
app.post("/api/ingest-files", (req, res) => {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({
      error: "Missing or invalid urls array",
    });
  }

  // Mock file processing - in reality, this would download and process the files
  console.log("Processing files from URLs:", urls);

  // Simulate successful ingestion
  res.json({
    status: "success",
    message: `Successfully processed ${urls.length} files`,
    processedUrls: urls,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`LLM Service running on port ${PORT}`);
});
