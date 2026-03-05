import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ShipmondoClient } from "../client.js";
import { PaginationSchema } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

export function registerAccountTools(
  server: McpServer,
  client: ShipmondoClient
): void {
  server.tool(
    "get_account",
    "Retrieve account information including name, email, and settings.",
    {},
    wrapToolError(async () => {
      return toText(await client.get("/account/"));
    })
  );

  server.tool(
    "get_account_balance",
    "Retrieve the current account balance.",
    {},
    wrapToolError(async () => {
      return toText(await client.get("/account/balance"));
    })
  );

  server.tool(
    "list_payment_requests",
    "List payment requests for the account.",
    { ...PaginationSchema.shape },
    wrapToolError(async (args) => {
      const params = PaginationSchema.parse(args);
      return toText(await client.get("/account/payment_requests", params));
    })
  );
}
