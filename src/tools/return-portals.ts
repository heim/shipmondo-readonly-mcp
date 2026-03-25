import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShipmondoClient } from "../client.js";
import { PaginationSchema, idString } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

const GetReturnPortalSchema = z.object({
  id: idString().describe("Return portal ID"),
});

const ListReturnPortalShipmentsSchema = PaginationSchema.extend({
  id: idString().describe("Return portal ID"),
});

export function registerReturnPortalTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "list_return_portals",
    "List all return portals configured in the account.",
    { ...PaginationSchema.shape },
    wrapToolError(async (args) => {
      const params = PaginationSchema.parse(args);
      return toText(await client.get("/return_portals", params));
    })
  );

  server.tool(
    "get_return_portal",
    "Retrieve a specific return portal by ID.",
    { ...GetReturnPortalSchema.shape },
    wrapToolError(async (args) => {
      const { id } = GetReturnPortalSchema.parse(args);
      return toText(await client.get(`/return_portals/${id}`));
    })
  );

  server.tool(
    "list_return_portal_shipments",
    "List shipments that were created through a specific return portal.",
    { ...ListReturnPortalShipmentsSchema.shape },
    wrapToolError(async (args) => {
      const { id, ...params } = ListReturnPortalShipmentsSchema.parse(args);
      return toText(
        await client.get(`/return_portals/${id}/shipments`, params)
      );
    })
  );
}
