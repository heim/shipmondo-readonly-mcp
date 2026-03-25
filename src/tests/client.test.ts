import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ShipmondoClient, ShipmondoApiError } from "../client.js";

function mockFetch(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

describe("ShipmondoClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("get()", () => {
    it("sends Basic auth header", async () => {
      const fetchMock = mockFetch({ id: 1 });
      vi.stubGlobal("fetch", fetchMock);

      const client = new ShipmondoClient("user", "key");
      await client.get("/shipments");

      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
      const auth = (options.headers as Record<string, string>)["Authorization"];
      expect(auth).toBe(
        "Basic " + Buffer.from("user:key").toString("base64")
      );
    });

    it("uses production URL by default", async () => {
      const fetchMock = mockFetch({});
      vi.stubGlobal("fetch", fetchMock);

      const client = new ShipmondoClient("user", "key");
      await client.get("/account/");

      const [url] = fetchMock.mock.calls[0] as [string];
      expect(url).toContain("app.shipmondo.com");
    });

    it("uses sandbox URL when sandbox=true", async () => {
      const fetchMock = mockFetch({});
      vi.stubGlobal("fetch", fetchMock);

      const client = new ShipmondoClient("user", "key", true);
      await client.get("/account/");

      const [url] = fetchMock.mock.calls[0] as [string];
      expect(url).toContain("sandbox.shipmondo.com");
    });

    it("returns parsed JSON body", async () => {
      vi.stubGlobal("fetch", mockFetch([{ id: "SM001" }]));

      const client = new ShipmondoClient("user", "key");
      const result = await client.get("/shipments");
      expect(result).toEqual([{ id: "SM001" }]);
    });

    it("appends query params, skipping undefined and empty values", async () => {
      const fetchMock = mockFetch([]);
      vi.stubGlobal("fetch", fetchMock);

      const client = new ShipmondoClient("user", "key");
      await client.get("/shipments", {
        carrier_code: "gls",
        reference: undefined,
        page: 1,
      });

      const [url] = fetchMock.mock.calls[0] as [string];
      const parsed = new URL(url);
      expect(parsed.searchParams.get("carrier_code")).toBe("gls");
      expect(parsed.searchParams.get("page")).toBe("1");
      expect(parsed.searchParams.has("reference")).toBe(false);
    });

    it("throws ShipmondoApiError on non-OK response", async () => {
      vi.stubGlobal("fetch", mockFetch({ message: "Unauthorized" }, 401));

      const client = new ShipmondoClient("user", "key");
      await expect(client.get("/account/")).rejects.toThrow(ShipmondoApiError);
      await expect(client.get("/account/")).rejects.toMatchObject({ status: 401 });
    });

    it("ShipmondoApiError has correct name and status", async () => {
      vi.stubGlobal("fetch", mockFetch("Not Found", 404));

      const client = new ShipmondoClient("user", "key");
      try {
        await client.get("/shipments/missing");
      } catch (e) {
        expect(e).toBeInstanceOf(ShipmondoApiError);
        expect((e as ShipmondoApiError).name).toBe("ShipmondoApiError");
        expect((e as ShipmondoApiError).status).toBe(404);
        expect((e as ShipmondoApiError).message).toContain("404");
      }
    });
  });
});
