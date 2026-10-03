import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
test("stdio discovery, preview, validation and unsafe path rejection", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "mcp project "));
  t.after(() => rm(root, { recursive: true, force: true }));
  await copyFile(
    new URL("./fixtures/project.json", import.meta.url),
    join(root, "project.json"),
  );
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      process.env.PARALLAX_TEST_CLI ??
        new URL("../dist/cli.js", import.meta.url).pathname,
      "mcp",
      "--root",
      root,
    ],
    stderr: "pipe",
  });
  const client = new Client({ name: "parallax-test", version: "1.0.0" });
  await client.connect(transport);
  try {
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map((t) => t.name).sort(), [
      "parallax_create_preview",
      "parallax_design_guidance",
      "parallax_export_handoff",
      "parallax_validate_project",
    ]);
    assert.match(client.getInstructions() ?? "", /parallax_design_guidance/);
    const guidanceTool = tools.tools.find(
      (t) => t.name === "parallax_design_guidance",
    )!;
    assert.equal(guidanceTool.annotations?.readOnlyHint, true);
    assert.equal(guidanceTool.inputSchema.additionalProperties, false);
    for (const phase of [
      "discovery",
      "concepts",
      "preview",
      "assets",
      "build",
      "review",
    ]) {
      const guide = await client.callTool({
        name: "parallax_design_guidance",
        arguments: { phase },
      });
      assert.ok(!guide.isError);
      const data = guide.structuredContent as any;
      assert.equal(data.phase, phase);
      assert.match(data.workflow, /Clarify audience/);
      assert.ok(data.references.length > 0);
      assert.ok(Object.keys(data.templates).length > 0);
      if (phase === "discovery")
        assert.match(
          data.references.map((r: any) => r.content).join("\n"),
          /audience/i,
        );
      if (phase === "preview")
        assert.equal(data.templates["project.json"].schemaVersion, 1);
      if (phase === "build" || phase === "review")
        assert.match(
          data.references.map((r: any) => r.content).join("\n"),
          /start.*middle.*end/i,
        );
    }
    for (const args of [
      { phase: "unknown" },
      { phase: "discovery", path: "../secret" },
    ]) {
      const bad = await client.callTool({
        name: "parallax_design_guidance",
        arguments: args,
      });
      assert.equal(bad.isError, true);
    }
    const result = await client.callTool({
      name: "parallax_create_preview",
      arguments: { recordPath: "project.json", outputPath: "wireframe.html" },
    });
    assert.ok(!result.isError);
    const valid = await client.callTool({
      name: "parallax_validate_project",
      arguments: { recordPath: "project.json" },
    });
    assert.equal((valid.structuredContent as any).approvalStatus, "missing");
    const bad = await client.callTool({
      name: "parallax_create_preview",
      arguments: { recordPath: "project.json", outputPath: "../escape" },
    });
    assert.equal(bad.isError, true);
    const handoff = await client.callTool({
      name: "parallax_export_handoff",
      arguments: { recordPath: "project.json", outputPath: "handoff.md" },
    });
    assert.equal(handoff.isError, true);
  } finally {
    await client.close();
  }
});
