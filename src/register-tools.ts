import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerArchitecturalTools } from "./tools/architectural.js";
import { registerStructuralTools } from "./tools/structural.js";
import { registerMepTools } from "./tools/mep.js";

export function registerAllTools(server: McpServer): void {
  registerArchitecturalTools(server);
  registerStructuralTools(server);
  registerMepTools(server);
}
