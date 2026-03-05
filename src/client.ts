const PRODUCTION_BASE_URL = "https://app.shipmondo.com/api/public/v3";
const SANDBOX_BASE_URL = "https://sandbox.shipmondo.com/api/public/v3";

export class ShipmondoApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: string
  ) {
    super(`Shipmondo API error ${status} ${statusText}: ${body}`);
    this.name = "ShipmondoApiError";
  }
}

export class ShipmondoClient {
  private baseUrl: string;
  private authHeader: string;

  constructor(apiUser: string, apiKey: string, sandbox = false) {
    this.baseUrl = sandbox ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL;
    this.authHeader =
      "Basic " + Buffer.from(`${apiUser}:${apiKey}`).toString("base64");
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: this.authHeader,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new ShipmondoApiError(response.status, response.statusText, body);
    }

    return response.json() as Promise<T>;
  }
}
