import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createPreview } from "./preview.ts";
import { validateProject, exportHandoff } from "./project.ts";
const path = z.string().min(1).max(1000);
export async function startMcp(root: string): Promise<void> {
  const server = new McpServer({
    name: "parallax-effect-pro",
    version: "0.1.0",
  });
  const respond = async (operation: () => Promise<object>) => {
    try {
      const result = await operation();
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result) }],
        structuredContent: { ...result },
      };
    } catch {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: "Operation refused. Check record schema, contained paths, existing output, and current human approval.",
          },
        ],
      };
    }
  };
  server.registerTool(
    "parallax_create_preview",
    {
      description:
        "Create a local animated wireframe. Does not approve designs or generate paid assets.",
      inputSchema: z.strictObject({ recordPath: path, outputPath: path }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (args) =>
      respond(() => createPreview(root, args.recordPath, args.outputPath)),
  );
  server.registerTool(
    "parallax_validate_project",
    {
      description:
        "Validate project records and report whether approval is missing, stale, or recorded. Records are not authenticated human proof.",
      inputSchema: z.strictObject({ recordPath: path }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => respond(() => validateProject(root, args.recordPath)),
  );
  server.registerTool(
    "parallax_export_handoff",
    {
      description:
        "Export a complete website brief only when recorded layout/motion approval matches the design and preview.",
      inputSchema: z.strictObject({ recordPath: path, outputPath: path }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (args) =>
      respond(() => exportHandoff(root, args.recordPath, args.outputPath)),
  );
  await server.connect(new StdioServerTransport());
}
