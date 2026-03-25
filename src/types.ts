import { z } from "zod";

/** Reusable ID schema — alphanumeric, hyphens, underscores only. */
export const idString = () =>
  z.string().regex(/^[\w-]+$/, "ID must be alphanumeric, hyphens, or underscores");

export const PaginationSchema = z.object({
  page: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Page number (starting at 1)"),
  page_size: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Number of results per page (max 100)"),
});
