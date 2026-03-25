import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShipmondoClient } from "../client.js";
import { PaginationSchema, idString } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

const ListShipmentsSchema = PaginationSchema.extend({
  shipment_id: idString().optional().describe("Filter by shipment ID"),
  reference: z.string().optional().describe("Filter by reference"),
  carrier_code: z.string().optional().describe("Filter by carrier code"),
  product_code: z.string().optional().describe("Filter by product code"),
  receiver_country: z
    .string()
    .optional()
    .describe("Filter by receiver country code (ISO 3166-1 alpha-2)"),
  created_at_min: z
    .string()
    .optional()
    .describe("Filter by creation date, earliest (ISO 8601)"),
  created_at_max: z
    .string()
    .optional()
    .describe("Filter by creation date, latest (ISO 8601)"),
});

const GetShipmentSchema = z.object({
  id: idString().describe("Shipment ID"),
});

const GetShipmentLabelsSchema = z.object({
  id: idString().describe("Shipment ID"),
  label_format: z
    .string()
    .optional()
    .describe("Label format (e.g. A4_PDF, 10x19_PDF)"),
});

export function registerShipmentTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "list_shipments",
    "List all shipments with optional filtering by reference, carrier, product, country, or date range.",
    { ...ListShipmentsSchema.shape },
    wrapToolError(async (args) => {
      const params = ListShipmentsSchema.parse(args);
      return toText(await client.get("/shipments", params));
    })
  );

  server.tool(
    "get_shipment",
    "Retrieve a specific shipment by ID, including parcel details, tracking, and label info.",
    { ...GetShipmentSchema.shape },
    wrapToolError(async (args) => {
      const { id } = GetShipmentSchema.parse(args);
      return toText(await client.get(`/shipments/${id}`));
    })
  );

  server.tool(
    "get_shipment_labels",
    "Retrieve label(s) for a shipment. Returns label data in the requested format.",
    { ...GetShipmentLabelsSchema.shape },
    wrapToolError(async (args) => {
      const { id, ...params } = GetShipmentLabelsSchema.parse(args);
      return toText(await client.get(`/shipments/${id}/labels`, params));
    })
  );
}
