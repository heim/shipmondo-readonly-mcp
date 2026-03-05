import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ShipmondoClient } from "./client.js";
import {
  registerAccountTools,
  registerShipmentTools,
  registerSalesOrderTools,
  registerProductTools,
  registerServicePointTools,
  registerDraftTools,
  registerWaybillTools,
  registerReturnPortalTools,
  registerPickupRequestTools,
  registerWebhookTools,
  registerPrinterTools,
  registerItemTools,
  registerBookkeepingTools,
} from "./tools/index.js";

export function createServer(
  apiUser: string,
  apiKey: string,
  sandbox: boolean
): McpServer {
  const server = new McpServer({
    name: "shipmondo-mcp",
    version: "1.0.0",
  });

  const client = new ShipmondoClient(apiUser, apiKey, sandbox);

  registerAccountTools(server, client);
  registerShipmentTools(server, client);
  registerSalesOrderTools(server, client);
  registerProductTools(server, client);
  registerServicePointTools(server, client);
  registerDraftTools(server, client);
  registerWaybillTools(server, client);
  registerReturnPortalTools(server, client);
  registerPickupRequestTools(server, client);
  registerWebhookTools(server, client);
  registerPrinterTools(server, client);
  registerItemTools(server, client);
  registerBookkeepingTools(server, client);

  return server;
}
