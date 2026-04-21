import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./register-tools.js";

const server = new McpServer({ name: "tad-mcp-rvt-qto", version: "1.0.0" });
registerAllTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("TAD Revit QTO MCP Server started (stdio)");
