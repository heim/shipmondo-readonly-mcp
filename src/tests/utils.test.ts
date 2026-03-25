import { describe, it, expect } from "vitest";
import { wrapToolError, toText } from "../utils.js";
import { ShipmondoApiError } from "../client.js";

describe("toText()", () => {
  it("serializes data as pretty-printed JSON", () => {
    const result = toText({ id: "SM001", carrier: "GLS" });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(
      JSON.stringify({ id: "SM001", carrier: "GLS" }, null, 2)
    );
  });

  it("handles arrays", () => {
    const result = toText([1, 2, 3]);
    expect(JSON.parse(result.content[0].text)).toEqual([1, 2, 3]);
  });

  it("does not set isError", () => {
    const result = toText({});
    expect(result.isError).toBeUndefined();
  });
});

describe("wrapToolError()", () => {
  it("passes through successful results unchanged", async () => {
    const handler = wrapToolError(async () => ({
      content: [{ type: "text" as const, text: "hello" }],
    }));
    const result = await handler({});
    expect(result.content[0].text).toBe("hello");
    expect(result.isError).toBeUndefined();
  });

  it("catches ShipmondoApiError and returns isError=true", async () => {
    const handler = wrapToolError(async () => {
      throw new ShipmondoApiError(404, "Not Found", "shipment not found");
    });
    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("404");
    expect(result.content[0].text).toContain("Not Found");
    expect(result.content[0].text).toContain("shipment not found");
  });

  it("catches generic Error and returns isError=true", async () => {
    const handler = wrapToolError(async () => {
      throw new Error("network failure");
    });
    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("network failure");
  });

  it("catches non-Error thrown values", async () => {
    const handler = wrapToolError(async () => {
      throw "a string error"; // eslint-disable-line no-throw-literal
    });
    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("a string error");
  });
});
