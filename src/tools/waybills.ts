import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShipmondoClient } from "../client.js";
import { PaginationSchema } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

const GetWaybillSchema = z.object({
  id: z.string().describe("Waybill ID"),
});

const WaybillIdSchema = z.object({
  waybill_id: z.string().describe("Waybill ID"),
});

export function registerWaybillTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "list_waybills",
    "List all waybills (bulk transport documents used for carrier pickup).",
    { ...PaginationSchema.shape },
    wrapToolError(async (args) => {
      const params = PaginationSchema.parse(args);
      return toText(await client.get("/waybills", params));
    })
  );

  server.tool(
    "get_waybill",
    "Retrieve a specific waybill by ID.",
    { ...GetWaybillSchema.shape },
    wrapToolError(async (args) => {
      const { id } = GetWaybillSchema.parse(args);
      return toText(await client.get(`/waybills/${id}`));
    })
  );

  server.tool(
    "list_waybill_load_carriers",
    "List load carriers (pallets, cages) associated with a specific waybill.",
    { ...WaybillIdSchema.shape },
    wrapToolError(async (args) => {
      const { waybill_id } = WaybillIdSchema.parse(args);
      return toText(await client.get(`/waybills/${waybill_id}/load_carriers`));
    })
  );
}
