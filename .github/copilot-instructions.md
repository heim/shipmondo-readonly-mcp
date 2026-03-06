# Copilot Instructions

This is a read-only MCP server for the Shipmondo shipping API. See CLAUDE.md for architecture and conventions.

When reviewing code in this repository:
- Verify all tools only make HTTP GET requests (read-only guarantee)
- Check that new tools use `wrapToolError` and `toText` from `utils.ts`
- Ensure new tools are registered in `server.ts` via a `registerXxxTools` call
- Flag any direct `process.env` reads outside of `index.ts`
- Confirm sandbox mode is respected by passing the `client` instance (which already handles the base URL)
