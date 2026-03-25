import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShipmondoClient } from "../client.js";
import { PaginationSchema, idString } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

const ListSalesOrdersSchema = PaginationSchema.extend({
  order_id: idString().optional().describe("Filter by order ID"),
  reference: z.string().optional().describe("Filter by reference"),
  order_state: z
    .string()
    .optional()
    .describe("Filter by state (e.g. pending, completed)"),
  created_at_min: z
    .string()
    .optional()
    .describe("Filter by creation date, earliest (ISO 8601)"),
  created_at_max: z
    .string()
    .optional()
    .describe("Filter by creation date, latest (ISO 8601)"),
});

const GetSalesOrderSchema = z.object({
  id: idString().describe("Sales order ID"),
});

export function registerSalesOrderTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "list_sales_orders",
    "List all sales orders with optional filtering by order ID, reference, state, or date range.",
    { ...ListSalesOrdersSchema.shape },
    wrapToolError(async (args) => {
      const params = ListSalesOrdersSchema.parse(args);
      return toText(await client.get("/sales_orders", params));
    })
  );

  server.tool(
    "get_sales_order",
    "Retrieve a specific sales order by ID, including order lines, receiver, and shipping details.",
    { ...GetSalesOrderSchema.shape },
    wrapToolError(async (args) => {
      const { id } = GetSalesOrderSchema.parse(args);
      return toText(await client.get(`/sales_orders/${id}`));
    })
  );

  server.tool(
    "get_sales_order_pick_list",
    "Retrieve the pick list for a specific sales order.",
    { ...GetSalesOrderSchema.shape },
    wrapToolError(async (args) => {
      const { id } = GetSalesOrderSchema.parse(args);
      return toText(await client.get(`/sales_orders/${id}/pick_list`));
    })
  );

  server.tool(
    "get_sales_order_packing_slips",
    "Retrieve packing slips for a specific sales order.",
    { ...GetSalesOrderSchema.shape },
    wrapToolError(async (args) => {
      const { id } = GetSalesOrderSchema.parse(args);
      return toText(await client.get(`/sales_orders/${id}/packing_slips`));
    })
  );

  server.tool(
    "get_pick_lists",
    "Retrieve pick lists across all sales orders.",
    { ...PaginationSchema.shape },
    wrapToolError(async (args) => {
      const params = PaginationSchema.parse(args);
      return toText(await client.get("/pick_lists", params));
    })
  );
}
