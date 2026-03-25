# shipmondo-mcp — Claude Code Instructions

## Project overview

Read-only MCP server for the Shipmondo shipping API. Exposes Shipmondo v3 GET endpoints as MCP tools.

## Stack

- TypeScript, ESM (`"type": "module"`)
- `@modelcontextprotocol/sdk` for MCP
- `zod` for schema validation
- Output compiled to `build/`

## Architecture

```
src/
  index.ts       # Bootstrap: validate env vars, wire transport, connect
  server.ts      # createServer(): instantiate McpServer, register all tools
  client.ts      # ShipmondoClient: HTTP client with Basic auth, get()
  types.ts       # Shared TypeScript types
  utils.ts       # Shared helpers
  tools/         # One file per Shipmondo resource domain
    index.ts     # Re-exports all register*Tools functions
    shipments.ts # registerShipmentTools(server, client)
    ...
```

## Conventions

### Tool registration
Tools are registered via `registerXxxTools(server, client)` functions in `src/tools/`.
Each tool file exports one register function. All register functions are called in `server.ts`.

### Error handling
API errors throw `ShipmondoApiError`. Tool handlers let errors propagate — the MCP framework catches them.

### Env var validation
Validate required env vars at startup in `index.ts` and call `process.exit(1)` with a clear message if missing. Do not validate lazily at tool-call time.

Required env vars:
- `SHIPMONDO_API_USER`
- `SHIPMONDO_API_KEY`
- `SHIPMONDO_SANDBOX` (optional, `"true"` to use sandbox)

### Startup log
After `server.connect(transport)`, write a startup message to stderr:
```ts
process.stderr.write(`Shipmondo MCP server running on stdio (${sandbox ? "sandbox" : "production"})\n`);
```

### Module imports
Always use `.js` extensions in imports (NodeNext resolution), e.g. `import { X } from "./server.js"`.

## Build & dev

```bash
npm run build   # tsc
npm run dev     # tsx (no build step)
```

## Build & tests

```bash
npm run build   # tsc
npm run dev     # tsx (no build step)
npm test        # vitest run
npm run test:watch  # vitest watch
```

## Missing: README

This server does not yet have a README. When creating one, follow this structure:
- Features list
- Requirements
- Installation
- Usage (Claude Desktop config, Claude Code CLI, dev mode)
- Available tools table
- Development commands

## Standards

- Module system: ESM, `NodeNext`, output to `build/`
- `index.ts` has `#!/usr/bin/env node` shebang
- Env vars validated at startup, fail-fast with `process.exit(1)`
- Startup message written to `process.stderr` after connect
- `bin` field in `package.json` pointing to `build/index.js`
- `server.ts` handles all tool registration (not inline in `index.ts`)
- `client.ts` wraps all HTTP logic
- Tests via vitest — run with `npm test`
- README documents env vars, Claude Desktop config, and available tools
