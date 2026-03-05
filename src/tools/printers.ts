import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ShipmondoClient } from "../client.js";
import { PaginationSchema } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

export function registerPrinterTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "list_printers",
    "List all printers connected to the Shipmondo print client.",
    { ...PaginationSchema.shape },
    wrapToolError(async (args) => {
      const params = PaginationSchema.parse(args);
      return toText(await client.get("/printers", params));
    })
  );
}
