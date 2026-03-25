import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShipmondoClient } from "../client.js";
import { PaginationSchema, idString } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

const GetWebhookSchema = z.object({
  id: idString().describe("Webhook ID"),
});

export function registerWebhookTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "list_webhooks",
    "List all configured webhooks.",
    { ...PaginationSchema.shape },
    wrapToolError(async (args) => {
      const params = PaginationSchema.parse(args);
      return toText(await client.get("/webhooks", params));
    })
  );

  server.tool(
    "get_webhook",
    "Retrieve a specific webhook by ID.",
    { ...GetWebhookSchema.shape },
    wrapToolError(async (args) => {
      const { id } = GetWebhookSchema.parse(args);
      return toText(await client.get(`/webhooks/${id}`));
    })
  );
}
