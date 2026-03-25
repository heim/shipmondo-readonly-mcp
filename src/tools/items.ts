import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShipmondoClient } from "../client.js";
import { PaginationSchema, idString } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

const ListItemsSchema = PaginationSchema.extend({
  item_number: z
    .string()
    .optional()
    .describe("Filter by item/SKU number"),
});

const GetItemSchema = z.object({
  id: idString().describe("Item ID"),
});

export function registerItemTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "list_items",
    "List all items (product catalogue entries used in sales orders).",
    { ...ListItemsSchema.shape },
    wrapToolError(async (args) => {
      const params = ListItemsSchema.parse(args);
      return toText(await client.get("/items", params));
    })
  );

  server.tool(
    "get_item",
    "Retrieve a specific item by ID.",
    { ...GetItemSchema.shape },
    wrapToolError(async (args) => {
      const { id } = GetItemSchema.parse(args);
      return toText(await client.get(`/items/${id}`));
    })
  );
}
