const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configure logging
const logger = {
  debug: (message, data) => {
    if (data) {
      console.log(`[DEBUG] ${message}`, data);
    } else {
      console.log(`[DEBUG] ${message}`);
    }
  },
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message, error) => {
    console.error(`[ERROR] ${message}`);
    if (error) console.error(error);
  },
};

// Mock data storage
const chatLogs = {};

// Utility functions
function appendChatToFile(chatId, query, answer) {
  if (!chatId) return;

  if (!chatLogs[chatId]) {
    chatLogs[chatId] = [];
  }

  chatLogs[chatId].push({ query, answer });
  logger.debug(`Appended to chat log for chat_id: ${chatId}`);
}

function readEntireChat(chatId) {
  if (!chatId || !chatLogs[chatId]) {
    return [];
  }

  return chatLogs[chatId];
}

// Log request details before processing
app.use((req, res, next) => {
  logger.debug("Headers:", dict(req.headers));
  logger.debug("Body:", req.body);
  next();
});

// Log response details
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    logger.debug("Response:", data);
    return originalSend.call(this, data);
  };
  next();
});

// Helper function to convert headers to dictionary
function dict(headers) {
  return Object.fromEntries(Object.entries(headers));
}

// Ingest Endpoint
app.post("/ingest", (req, res) => {
  logger.debug(
    `Received ingest request. Headers: ${JSON.stringify(dict(req.headers))}`
  );
  const data = req.body;
  logger.debug(`Ingest request data: ${JSON.stringify(data)}`);

  if (!data || !Array.isArray(data.urls)) {
    logger.error("Invalid request: missing or invalid urls array");
    return res
      .status(400)
      .json({ error: "Invalid request: urls array is required" });
  }

  try {
    const processedUrls = [];

    // Mock processing each URL
    for (const url of data.urls) {
      try {
        logger.debug(`Processing URL: ${url}`);
        logger.debug(`Successfully downloaded file from URL: ${url}`);
        logger.debug(
          `Successfully processed and indexed file from URL: ${url}`
        );
        processedUrls.push(url);
      } catch (e) {
        logger.error(`Failed to process URL ${url}: ${e.message}`, e);
        // Continue processing other URLs even if one fails
      }
    }

    const result = {
      status: processedUrls.length > 0 ? "success" : "partial_success",
      processedUrls: processedUrls,
      message: `Successfully processed ${processedUrls.length} files`,
    };

    logger.debug(`Returning result: ${JSON.stringify(result)}`);
    return res.json(result);
  } catch (e) {
    logger.error(`Error during file ingestion: ${e.message}`, e);
    return res
      .status(500)
      .json({ error: `Failed to process files: ${e.message}` });
  }
});

// Chat Endpoint
app.post("/chat", (req, res) => {
  logger.debug(
    `Received chat request. Headers: ${JSON.stringify(dict(req.headers))}`
  );
  logger.debug(`Request method: ${req.method}`);
  logger.debug(`Request content type: ${req.get("Content-Type")}`);

  try {
    const data = req.body;
    logger.debug(`Chat request data: ${JSON.stringify(data)}`);

    // Validate required fields
    const query = (data?.query || "").trim();
    const chatId = (data?.chat_id || "").trim();

    logger.debug(`Processed query: ${query}`);
    logger.debug(`Processed chat_id: ${chatId}`);

    if (!query) {
      logger.error("Missing query parameter");
      return res.status(400).json({ error: "Query is required" });
    }

    if (!chatId) {
      logger.error("Missing chat_id parameter");
      return res.status(400).json({ error: "Chat ID is required" });
    }

    // Generate mock answer
    logger.debug("Calling retriever for answer");
    const answer = `This is a mock response to your query: "${query}". In a real implementation, this would use RAG to generate a contextual answer.`;
    logger.debug(`Got answer from retriever: ${answer.substring(0, 100)}...`);

    // Log chat history
    logger.debug(`Appending to chat log for chat_id: ${chatId}`);
    appendChatToFile(chatId, query, answer);

    return res.json({ answer });
  } catch (e) {
    logger.error(`Error processing chat request: ${e.message}`, e);
    return res
      .status(500)
      .json({ error: `Internal server error: ${e.message}` });
  }
});

// History Endpoint
app.get("/history/:chatId", (req, res) => {
  const chatId = req.params.chatId;
  logger.debug(`Received history request for chat_id: ${chatId}`);

  if (!chatId) {
    logger.error("Missing chat_id parameter");
    return res.status(400).json({ error: "Chat ID is required" });
  }

  try {
    const chatHistory = readEntireChat(chatId);
    return res.json({ history: chatHistory });
  } catch (e) {
    logger.error(`Error reading chat history: ${e.message}`, e);
    return res
      .status(500)
      .json({ error: `Failed to read chat history: ${e.message}` });
  }
});

// Add CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  next();
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Mock Bonsai RAG API Server running on port ${PORT}`);
});
