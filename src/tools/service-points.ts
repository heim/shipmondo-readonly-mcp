import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShipmondoClient } from "../client.js";
import { wrapToolError, toText } from "../utils.js";

const ListServicePointsSchema = z.object({
  carrier_code: z.string().describe("Carrier code (required)"),
  country_code: z
    .string()
    .describe("Country code (ISO 3166-1 alpha-2, required)"),
  zipcode: z.string().optional().describe("Postal/ZIP code to search near"),
  address: z.string().optional().describe("Street address to search near"),
  product_code: z.string().optional().describe("Filter by product code"),
  limit: z.number().int().optional().describe("Maximum number of results"),
});

const GetServicePointSchema = z.object({
  id: z.string().describe("Service point ID"),
  carrier_code: z.string().optional().describe("Carrier code"),
  country_code: z.string().optional().describe("Country code"),
});

export function registerServicePointTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "list_service_points",
    "List service points (parcel shops, pickup locations) for a carrier and country, optionally near a specific address.",
    { ...ListServicePointsSchema.shape },
    wrapToolError(async (args) => {
      const params = ListServicePointsSchema.parse(args);
      return toText(await client.get("/service_points", params));
    })
  );

  server.tool(
    "get_service_point",
    "Retrieve details of a specific service point by ID.",
    { ...GetServicePointSchema.shape },
    wrapToolError(async (args) => {
      const { id, ...params } = GetServicePointSchema.parse(args);
      return toText(await client.get(`/service_points/${id}`, params));
    })
  );
}
