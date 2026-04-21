import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerArchitecturalTools } from './tools/architectural.js';
import { registerStructuralTools } from './tools/structural.js';
import { registerMepTools } from './tools/mep.js';

const server = new McpServer({
  name: 'tad-mcp-rvt-qto',
  version: '1.0.0',
});

registerArchitecturalTools(server);
registerStructuralTools(server);
registerMepTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error('TAD Revit QTO MCP Server started');
