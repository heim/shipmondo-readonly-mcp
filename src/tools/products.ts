import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShipmondoClient } from "../client.js";
import { wrapToolError, toText } from "../utils.js";

const ListProductsSchema = z.object({
  carrier_code: z.string().optional().describe("Filter by carrier code"),
  sender_country: z
    .string()
    .optional()
    .describe("Sender country code (ISO 3166-1 alpha-2)"),
  receiver_country: z
    .string()
    .optional()
    .describe("Receiver country code (ISO 3166-1 alpha-2)"),
});

export function registerProductTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "list_carriers",
    "List all available carriers.",
    {},
    wrapToolError(async () => {
      return toText(await client.get("/carriers"));
    })
  );

  server.tool(
    "list_products",
    "List available shipping products, optionally filtered by carrier or sender/receiver country.",
    { ...ListProductsSchema.shape },
    wrapToolError(async (args) => {
      const params = ListProductsSchema.parse(args);
      return toText(await client.get("/products", params));
    })
  );

  server.tool(
    "list_package_types",
    "List available package types.",
    {},
    wrapToolError(async () => {
      return toText(await client.get("/package_types"));
    })
  );
}
