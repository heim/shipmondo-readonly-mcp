import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShipmondoClient } from "../client.js";
import { wrapToolError, toText } from "../utils.js";

const GetIntegrationSchema = z.object({
  id: z.string().describe("Bookkeeping integration ID"),
});

const GetPaymentGatewaySchema = z.object({
  id: z.string().describe("Payment gateway ID"),
});

export function registerBookkeepingTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "list_bookkeeping_integrations",
    "List all bookkeeping integrations connected to the account.",
    {},
    wrapToolError(async () => {
      return toText(await client.get("/bookkeeping_integrations"));
    })
  );

  server.tool(
    "get_bookkeeping_integration",
    "Retrieve a specific bookkeeping integration by ID.",
    { ...GetIntegrationSchema.shape },
    wrapToolError(async (args) => {
      const { id } = GetIntegrationSchema.parse(args);
      return toText(await client.get(`/bookkeeping_integrations/${id}`));
    })
  );

  server.tool(
    "list_payment_gateways",
    "List all payment gateways configured in the account.",
    {},
    wrapToolError(async () => {
      return toText(await client.get("/payment_gateways"));
    })
  );

  server.tool(
    "get_payment_gateway",
    "Retrieve a specific payment gateway by ID.",
    { ...GetPaymentGatewaySchema.shape },
    wrapToolError(async (args) => {
      const { id } = GetPaymentGatewaySchema.parse(args);
      return toText(await client.get(`/payment_gateways/${id}`));
    })
  );
}
