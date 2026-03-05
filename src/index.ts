#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

const apiUser = process.env.SHIPMONDO_API_USER;
const apiKey = process.env.SHIPMONDO_API_KEY;

if (!apiUser) {
  process.stderr.write(
    "Error: SHIPMONDO_API_USER environment variable is required\n"
  );
  process.exit(1);
}
if (!apiKey) {
  process.stderr.write(
    "Error: SHIPMONDO_API_KEY environment variable is required\n"
  );
  process.exit(1);
}

const sandbox = process.env.SHIPMONDO_SANDBOX === "true";

const server = createServer(apiUser, apiKey, sandbox);
const transport = new StdioServerTransport();

await server.connect(transport);
process.stderr.write(
  `Shipmondo MCP server running on stdio (${sandbox ? "sandbox" : "production"})\n`
);
