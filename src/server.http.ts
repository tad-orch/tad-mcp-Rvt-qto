import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { registerAllTools } from "./register-tools.js";

const app = express();
app.use(express.json());

const server = new McpServer({ name: "tad-mcp-rvt-qto", version: "1.0.0" });
registerAllTools(server);

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
await server.connect(transport);

app.all("/mcp", (req, res) => transport.handleRequest(req, res, req.body));

app.get("/health", (_req, res) => res.json({ status: "ok", name: "tad-mcp-rvt-qto" }));

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`TAD MCP QTO running on port ${PORT}`));
