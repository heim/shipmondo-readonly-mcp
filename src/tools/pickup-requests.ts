import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShipmondoClient } from "../client.js";
import { PaginationSchema } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

const GetPickupRequestSchema = z.object({
  id: z.string().describe("Pickup request ID"),
});

export function registerPickupRequestTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "list_pickup_requests",
    "List all carrier pickup requests.",
    { ...PaginationSchema.shape },
    wrapToolError(async (args) => {
      const params = PaginationSchema.parse(args);
      return toText(await client.get("/pickup_requests", params));
    })
  );

  server.tool(
    "get_pickup_request",
    "Retrieve a specific carrier pickup request by ID.",
    { ...GetPickupRequestSchema.shape },
    wrapToolError(async (args) => {
      const { id } = GetPickupRequestSchema.parse(args);
      return toText(await client.get(`/pickup_requests/${id}`));
    })
  );
}
