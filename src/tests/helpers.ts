import { vi } from "vitest";
import type { ShipmondoClient } from "../client.js";

/** Creates a mock ShipmondoClient with spy methods. */
export function createMockClient(
  overrides: Partial<{ get: ShipmondoClient["get"] }> = {}
): ShipmondoClient {
  return {
    get: overrides.get ?? vi.fn().mockResolvedValue({}),
  } as unknown as ShipmondoClient;
}

/** Minimal mock McpServer that captures tool registrations. */
export type ToolHandler = (args: unknown) => Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}>;

export class MockMcpServer {
  tools: Map<string, ToolHandler> = new Map();

  tool(
    name: string,
    _description: string,
    _schema: unknown,
    handler: ToolHandler
  ) {
    this.tools.set(name, handler);
  }

  async call(name: string, args: unknown) {
    const handler = this.tools.get(name);
    if (!handler) throw new Error(`Tool not registered: ${name}`);
    return handler(args);
  }
}
