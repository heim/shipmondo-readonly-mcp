import { describe, it, expect, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MockMcpServer, createMockClient } from "./helpers.js";

import { registerAccountTools } from "../tools/account.js";
import { registerShipmentTools } from "../tools/shipments.js";
import { registerSalesOrderTools } from "../tools/sales-orders.js";
import { registerProductTools } from "../tools/products.js";
import { registerServicePointTools } from "../tools/service-points.js";
import { ShipmondoApiError } from "../client.js";

// --- account ---

describe("get_account", () => {
  it("calls GET /account/", async () => {
    const client = createMockClient({
      get: vi.fn().mockResolvedValue({ name: "Test Company" }),
    });
    const server = new MockMcpServer();
    registerAccountTools(server as unknown as McpServer, client);

    const result = await server.call("get_account", {});
    expect(client.get).toHaveBeenCalledWith("/account/");
    expect(JSON.parse(result.content[0].text)).toEqual({ name: "Test Company" });
  });
});

describe("get_account_balance", () => {
  it("calls GET /account/balance", async () => {
    const client = createMockClient({
      get: vi.fn().mockResolvedValue({ balance: 500.0 }),
    });
    const server = new MockMcpServer();
    registerAccountTools(server as unknown as McpServer, client);

    await server.call("get_account_balance", {});
    expect(client.get).toHaveBeenCalledWith("/account/balance");
  });
});

describe("list_payment_requests", () => {
  it("passes pagination params", async () => {
    const client = createMockClient();
    const server = new MockMcpServer();
    registerAccountTools(server as unknown as McpServer, client);

    await server.call("list_payment_requests", { page: 2, page_size: 50 });
    expect(client.get).toHaveBeenCalledWith(
      "/account/payment_requests",
      expect.objectContaining({ page: 2, page_size: 50 })
    );
  });
});

// --- shipments ---

describe("list_shipments", () => {
  it("calls GET /shipments with no filters", async () => {
    const client = createMockClient();
    const server = new MockMcpServer();
    registerShipmentTools(server as unknown as McpServer, client);

    await server.call("list_shipments", {});
    expect(client.get).toHaveBeenCalledWith(
      "/shipments",
      expect.objectContaining({})
    );
  });

  it("passes carrier_code filter", async () => {
    const client = createMockClient();
    const server = new MockMcpServer();
    registerShipmentTools(server as unknown as McpServer, client);

    await server.call("list_shipments", { carrier_code: "gls" });
    expect(client.get).toHaveBeenCalledWith(
      "/shipments",
      expect.objectContaining({ carrier_code: "gls" })
    );
  });
});

describe("get_shipment", () => {
  it("calls GET /shipments/{id}", async () => {
    const client = createMockClient({
      get: vi.fn().mockResolvedValue({ id: "SM123" }),
    });
    const server = new MockMcpServer();
    registerShipmentTools(server as unknown as McpServer, client);

    await server.call("get_shipment", { id: "SM123" });
    expect(client.get).toHaveBeenCalledWith("/shipments/SM123");
  });
});

describe("get_shipment_labels", () => {
  it("calls GET /shipments/{id}/labels with format param", async () => {
    const client = createMockClient();
    const server = new MockMcpServer();
    registerShipmentTools(server as unknown as McpServer, client);

    await server.call("get_shipment_labels", {
      id: "SM123",
      label_format: "A4_PDF",
    });
    expect(client.get).toHaveBeenCalledWith(
      "/shipments/SM123/labels",
      expect.objectContaining({ label_format: "A4_PDF" })
    );
  });
});

// --- sales orders ---

describe("list_sales_orders", () => {
  it("passes order_state filter", async () => {
    const client = createMockClient();
    const server = new MockMcpServer();
    registerSalesOrderTools(server as unknown as McpServer, client);

    await server.call("list_sales_orders", { order_state: "pending" });
    expect(client.get).toHaveBeenCalledWith(
      "/sales_orders",
      expect.objectContaining({ order_state: "pending" })
    );
  });
});

describe("get_sales_order", () => {
  it("calls GET /sales_orders/{id}", async () => {
    const client = createMockClient();
    const server = new MockMcpServer();
    registerSalesOrderTools(server as unknown as McpServer, client);

    await server.call("get_sales_order", { id: "SO456" });
    expect(client.get).toHaveBeenCalledWith("/sales_orders/SO456");
  });
});

// --- products ---

describe("list_carriers", () => {
  it("calls GET /carriers", async () => {
    const client = createMockClient({
      get: vi.fn().mockResolvedValue([{ code: "gls", name: "GLS" }]),
    });
    const server = new MockMcpServer();
    registerProductTools(server as unknown as McpServer, client);

    const result = await server.call("list_carriers", {});
    expect(client.get).toHaveBeenCalledWith("/carriers");
    expect(JSON.parse(result.content[0].text)).toEqual([
      { code: "gls", name: "GLS" },
    ]);
  });
});

describe("list_products (shipping products)", () => {
  it("calls GET /products with carrier filter", async () => {
    const client = createMockClient();
    const server = new MockMcpServer();
    registerProductTools(server as unknown as McpServer, client);

    await server.call("list_products", { carrier_code: "gls" });
    expect(client.get).toHaveBeenCalledWith(
      "/products",
      expect.objectContaining({ carrier_code: "gls" })
    );
  });
});

// --- service points ---

describe("list_service_points", () => {
  it("passes carrier, country, and zipcode filters", async () => {
    const client = createMockClient();
    const server = new MockMcpServer();
    registerServicePointTools(server as unknown as McpServer, client);

    await server.call("list_service_points", {
      carrier_code: "gls",
      country_code: "DK",
      zipcode: "8000",
    });
    expect(client.get).toHaveBeenCalledWith(
      "/service_points",
      expect.objectContaining({
        carrier_code: "gls",
        country_code: "DK",
        zipcode: "8000",
      })
    );
  });
});

// --- error propagation ---

describe("error handling", () => {
  it("returns isError=true when API call fails", async () => {
    const client = createMockClient({
      get: vi
        .fn()
        .mockRejectedValue(
          new ShipmondoApiError(500, "Internal Server Error", "unexpected")
        ),
    });
    const server = new MockMcpServer();
    registerAccountTools(server as unknown as McpServer, client);

    const result = await server.call("get_account", {});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("500");
    expect(result.content[0].text).toContain("unexpected");
  });

  it("returns isError=true on network error", async () => {
    const client = createMockClient({
      get: vi.fn().mockRejectedValue(new Error("fetch failed")),
    });
    const server = new MockMcpServer();
    registerAccountTools(server as unknown as McpServer, client);

    const result = await server.call("get_account", {});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("fetch failed");
  });
});
