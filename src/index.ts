#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = "https://app.shipmondo.com/api/public/v3";

function getAuthHeader(): string {
  const username = process.env.SHIPMONDO_API_USER;
  const apiKey = process.env.SHIPMONDO_API_KEY;
  if (!username || !apiKey) {
    throw new Error(
      "SHIPMONDO_API_USER and SHIPMONDO_API_KEY environment variables are required"
    );
  }
  return "Basic " + Buffer.from(`${username}:${apiKey}`).toString("base64");
}

async function shipmondoGet(
  path: string,
  params?: Record<string, string | number | boolean>
): Promise<unknown> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: getAuthHeader(),
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Shipmondo API error ${response.status}: ${body}`);
  }

  return response.json();
}

const tools = [
  // Account
  {
    name: "get_account",
    description: "Retrieve account information",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_account_balance",
    description: "Retrieve the current account balance",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_payment_requests",
    description: "List payment requests for the account",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number" },
        page_size: { type: "number", description: "Number of results per page" },
      },
    },
  },

  // Shipments
  {
    name: "list_shipments",
    description: "List all shipments",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number" },
        page_size: { type: "number", description: "Results per page" },
        shipment_id: { type: "string", description: "Filter by shipment ID" },
        reference: { type: "string", description: "Filter by reference" },
        created_at_min: {
          type: "string",
          description: "Filter by creation date (ISO 8601)",
        },
        created_at_max: {
          type: "string",
          description: "Filter by creation date (ISO 8601)",
        },
        carrier_code: { type: "string", description: "Filter by carrier code" },
        product_code: { type: "string", description: "Filter by product code" },
        receiver_country: {
          type: "string",
          description: "Filter by receiver country code (ISO 3166-1 alpha-2)",
        },
      },
    },
  },
  {
    name: "get_shipment",
    description: "Retrieve a specific shipment by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Shipment ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "get_shipment_labels",
    description: "Retrieve labels for a shipment",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Shipment ID" },
        label_format: {
          type: "string",
          description: "Label format (e.g. A4_PDF, 10x19_PDF)",
        },
      },
      required: ["id"],
    },
  },

  // Sales Orders
  {
    name: "list_sales_orders",
    description: "List all sales orders",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number" },
        page_size: { type: "number", description: "Results per page" },
        order_id: { type: "string", description: "Filter by order ID" },
        reference: { type: "string", description: "Filter by reference" },
        order_state: {
          type: "string",
          description: "Filter by state (e.g. pending, completed)",
        },
        created_at_min: {
          type: "string",
          description: "Filter by creation date (ISO 8601)",
        },
        created_at_max: {
          type: "string",
          description: "Filter by creation date (ISO 8601)",
        },
      },
    },
  },
  {
    name: "get_sales_order",
    description: "Retrieve a specific sales order by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Sales order ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "get_sales_order_pick_list",
    description: "Retrieve the pick list for a sales order",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Sales order ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "get_pick_lists",
    description: "Retrieve pick lists",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number" },
        page_size: { type: "number", description: "Results per page" },
      },
    },
  },

  // Products & Carriers
  {
    name: "list_carriers",
    description: "List all available carriers",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_products",
    description: "List available shipping products",
    inputSchema: {
      type: "object",
      properties: {
        carrier_code: { type: "string", description: "Filter by carrier code" },
        sender_country: {
          type: "string",
          description: "Sender country code (ISO 3166-1 alpha-2)",
        },
        receiver_country: {
          type: "string",
          description: "Receiver country code (ISO 3166-1 alpha-2)",
        },
      },
    },
  },
  {
    name: "list_package_types",
    description: "List available package types",
    inputSchema: { type: "object", properties: {} },
  },

  // Service Points
  {
    name: "list_service_points",
    description: "List service points (parcel shops, pickup locations)",
    inputSchema: {
      type: "object",
      properties: {
        carrier_code: {
          type: "string",
          description: "Carrier code (required)",
        },
        country_code: {
          type: "string",
          description: "Country code (ISO 3166-1 alpha-2, required)",
        },
        zipcode: { type: "string", description: "Postal/ZIP code" },
        address: { type: "string", description: "Street address" },
        product_code: { type: "string", description: "Filter by product code" },
        limit: { type: "number", description: "Max number of results" },
      },
      required: ["carrier_code", "country_code"],
    },
  },
  {
    name: "get_service_point",
    description: "Retrieve a specific service point by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Service point ID" },
        carrier_code: { type: "string", description: "Carrier code" },
        country_code: { type: "string", description: "Country code" },
      },
      required: ["id"],
    },
  },

  // Drafts
  {
    name: "list_drafts",
    description: "List all shipment drafts",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number" },
        page_size: { type: "number", description: "Results per page" },
      },
    },
  },
  {
    name: "get_draft",
    description: "Retrieve a specific shipment draft by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Draft ID" },
      },
      required: ["id"],
    },
  },

  // Waybills
  {
    name: "list_waybills",
    description: "List all waybills (bulk transport documents)",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number" },
        page_size: { type: "number", description: "Results per page" },
      },
    },
  },
  {
    name: "get_waybill",
    description: "Retrieve a specific waybill by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Waybill ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "list_waybill_load_carriers",
    description: "List load carriers for a waybill",
    inputSchema: {
      type: "object",
      properties: {
        waybill_id: { type: "string", description: "Waybill ID" },
      },
      required: ["waybill_id"],
    },
  },

  // Return Portals
  {
    name: "list_return_portals",
    description: "List all return portals",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number" },
        page_size: { type: "number", description: "Results per page" },
      },
    },
  },
  {
    name: "get_return_portal",
    description: "Retrieve a specific return portal by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Return portal ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "list_return_portal_shipments",
    description: "List shipments for a return portal",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Return portal ID" },
        page: { type: "number", description: "Page number" },
        page_size: { type: "number", description: "Results per page" },
      },
      required: ["id"],
    },
  },

  // Pickup Requests
  {
    name: "list_pickup_requests",
    description: "List all pickup requests",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number" },
        page_size: { type: "number", description: "Results per page" },
      },
    },
  },
  {
    name: "get_pickup_request",
    description: "Retrieve a specific pickup request by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Pickup request ID" },
      },
      required: ["id"],
    },
  },

  // Webhooks
  {
    name: "list_webhooks",
    description: "List all webhooks",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number" },
        page_size: { type: "number", description: "Results per page" },
      },
    },
  },
  {
    name: "get_webhook",
    description: "Retrieve a specific webhook by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Webhook ID" },
      },
      required: ["id"],
    },
  },

  // Printers
  {
    name: "list_printers",
    description: "List all printers connected to the print client",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number" },
        page_size: { type: "number", description: "Results per page" },
      },
    },
  },

  // Items
  {
    name: "list_items",
    description: "List all items (product catalog entries)",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number" },
        page_size: { type: "number", description: "Results per page" },
        item_number: {
          type: "string",
          description: "Filter by item/SKU number",
        },
      },
    },
  },
  {
    name: "get_item",
    description: "Retrieve a specific item by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Item ID" },
      },
      required: ["id"],
    },
  },

  // Bookkeeping Integrations
  {
    name: "list_bookkeeping_integrations",
    description: "List all bookkeeping integrations",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_bookkeeping_integration",
    description: "Retrieve a specific bookkeeping integration by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Integration ID" },
      },
      required: ["id"],
    },
  },

  // Payment Gateways
  {
    name: "list_payment_gateways",
    description: "List all payment gateways",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_payment_gateway",
    description: "Retrieve a specific payment gateway by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Payment gateway ID" },
      },
      required: ["id"],
    },
  },
] as const;

type ToolName = (typeof tools)[number]["name"];

async function handleTool(
  name: ToolName,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "get_account":
      return shipmondoGet("/account/");

    case "get_account_balance":
      return shipmondoGet("/account/balance");

    case "list_payment_requests":
      return shipmondoGet("/account/payment_requests", args as Record<string, string | number | boolean>);

    case "list_shipments":
      return shipmondoGet("/shipments", args as Record<string, string | number | boolean>);

    case "get_shipment":
      return shipmondoGet(`/shipments/${args.id}`);

    case "get_shipment_labels": {
      const { id, ...params } = args;
      return shipmondoGet(`/shipments/${id}/labels`, params as Record<string, string | number | boolean>);
    }

    case "list_sales_orders":
      return shipmondoGet("/sales_orders", args as Record<string, string | number | boolean>);

    case "get_sales_order":
      return shipmondoGet(`/sales_orders/${args.id}`);

    case "get_sales_order_pick_list":
      return shipmondoGet(`/sales_orders/${args.id}/pick_list`);

    case "get_pick_lists":
      return shipmondoGet("/pick_lists", args as Record<string, string | number | boolean>);

    case "list_carriers":
      return shipmondoGet("/carriers");

    case "list_products":
      return shipmondoGet("/products", args as Record<string, string | number | boolean>);

    case "list_package_types":
      return shipmondoGet("/package_types");

    case "list_service_points":
      return shipmondoGet("/service_points", args as Record<string, string | number | boolean>);

    case "get_service_point": {
      const { id, ...params } = args;
      return shipmondoGet(`/service_points/${id}`, params as Record<string, string | number | boolean>);
    }

    case "list_drafts":
      return shipmondoGet("/drafts", args as Record<string, string | number | boolean>);

    case "get_draft":
      return shipmondoGet(`/drafts/${args.id}`);

    case "list_waybills":
      return shipmondoGet("/waybills", args as Record<string, string | number | boolean>);

    case "get_waybill":
      return shipmondoGet(`/waybills/${args.id}`);

    case "list_waybill_load_carriers":
      return shipmondoGet(`/waybills/${args.waybill_id}/load_carriers`);

    case "list_return_portals":
      return shipmondoGet("/return_portals", args as Record<string, string | number | boolean>);

    case "get_return_portal":
      return shipmondoGet(`/return_portals/${args.id}`);

    case "list_return_portal_shipments": {
      const { id, ...params } = args;
      return shipmondoGet(`/return_portals/${id}/shipments`, params as Record<string, string | number | boolean>);
    }

    case "list_pickup_requests":
      return shipmondoGet("/pickup_requests", args as Record<string, string | number | boolean>);

    case "get_pickup_request":
      return shipmondoGet(`/pickup_requests/${args.id}`);

    case "list_webhooks":
      return shipmondoGet("/webhooks", args as Record<string, string | number | boolean>);

    case "get_webhook":
      return shipmondoGet(`/webhooks/${args.id}`);

    case "list_printers":
      return shipmondoGet("/printers", args as Record<string, string | number | boolean>);

    case "list_items":
      return shipmondoGet("/items", args as Record<string, string | number | boolean>);

    case "get_item":
      return shipmondoGet(`/items/${args.id}`);

    case "list_bookkeeping_integrations":
      return shipmondoGet("/bookkeeping_integrations");

    case "get_bookkeeping_integration":
      return shipmondoGet(`/bookkeeping_integrations/${args.id}`);

    case "list_payment_gateways":
      return shipmondoGet("/payment_gateways");

    case "get_payment_gateway":
      return shipmondoGet(`/payment_gateways/${args.id}`);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const server = new Server(
  { name: "shipmondo-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const result = await handleTool(
      name as ToolName,
      (args ?? {}) as Record<string, unknown>
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Shipmondo MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
