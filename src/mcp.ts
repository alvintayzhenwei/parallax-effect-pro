import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { createPreview } from "./preview.ts";
import { validateProject, exportHandoff } from "./project.ts";
const path = z.string().min(1).max(1000);
export async function startMcp(root: string): Promise<void> {
  const server = new McpServer(
    {
      name: "parallax-effect-pro",
      version: "0.1.0",
    },
    {
      instructions:
        "Start with parallax_design_guidance phase discovery. The host coding agent interviews the human, proposes three concepts, creates and revises previews, and obtains explicit approval of the exact revision and digest before assets or full-site implementation. Read guidance for each phase. This server returns packaged knowledge and local deterministic artifacts; it does not run a model, authenticate human approval, connect providers, or deploy. Preview controls are exploratory: save changes in the record and regenerate before approval.",
    },
  );
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
  const guides = {
    discovery: {
      references: ["theory", "effects"],
      templates: ["project.json"],
    },
    concepts: {
      references: ["theory", "effects"],
      templates: ["concepts.md", "project.json"],
    },
    preview: {
      references: ["effects", "implementation"],
      templates: ["project.json", "approval.md"],
    },
    assets: { references: ["providers", "effects"], templates: ["assets.md"] },
    build: {
      references: ["effects", "implementation", "quality-deployment"],
      templates: ["handoff.md", "quality-report.md"],
    },
    review: {
      references: ["effects", "quality-deployment"],
      templates: ["quality-report.md"],
    },
  } as const;
  server.registerTool(
    "parallax_design_guidance",
    {
      description:
        "Start here for a new website or revamp. Read canonical phase guidance and templates; ask the human about audience, purpose, action, content/assets, desired motion, incumbent stack and constraints. Propose three concepts, preview and adjust through MCP, then obtain exact revision approval before building. No model inference or arbitrary file reads.",
      inputSchema: z.strictObject({
        phase: z.enum([
          "discovery",
          "concepts",
          "preview",
          "assets",
          "build",
          "review",
        ]),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ phase }) =>
      respond(async () => {
        const base = new URL("../skills/parallax-effect-pro/", import.meta.url);
        const files = guides[phase];
        const references = await Promise.all(
          files.references.map(async (name) => ({
            path: `references/${name}.md`,
            content: await readFile(
              new URL(`references/${name}.md`, base),
              "utf8",
            ),
          })),
        );
        const templates = Object.fromEntries(
          await Promise.all(
            files.templates.map(async (name) => {
              const content = await readFile(
                new URL(`templates/${name}`, base),
                "utf8",
              );
              return [
                name,
                name.endsWith(".json") ? JSON.parse(content) : content,
              ];
            }),
          ),
        );
        return {
          phase,
          workflow: await readFile(new URL("SKILL.md", base), "utf8"),
          references,
          templates,
        };
      }),
  );
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
