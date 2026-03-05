import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShipmondoClient } from "../client.js";
import { PaginationSchema } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

const GetDraftSchema = z.object({
  id: z.string().describe("Draft ID"),
});

export function registerDraftTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "list_drafts",
    "List all shipment drafts.",
    { ...PaginationSchema.shape },
    wrapToolError(async (args) => {
      const params = PaginationSchema.parse(args);
      return toText(await client.get("/drafts", params));
    })
  );

  server.tool(
    "get_draft",
    "Retrieve a specific shipment draft by ID.",
    { ...GetDraftSchema.shape },
    wrapToolError(async (args) => {
      const { id } = GetDraftSchema.parse(args);
      return toText(await client.get(`/drafts/${id}`));
    })
  );
}
