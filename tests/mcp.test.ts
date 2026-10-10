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
      if (["discovery", "preview", "build", "review"].includes(phase)) {
        assert.ok(
          data.references.some((r: any) => r.path === "references/revamp.md"),
          `${phase} must expose existing-site integration guidance`,
        );
        assert.ok(data.templates["revamp.md"]);
      }
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

test("version 2 stdio preview, approval validation and scoped handoff", async (t) => {
  const { readFile, writeFile } = await import("node:fs/promises");
  const root = await mkdtemp(join(tmpdir(), "mcp-story-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const story = JSON.parse(
    await readFile(new URL("fixtures/story.json", import.meta.url), "utf8"),
  );
  await writeFile(join(root, "story.json"), JSON.stringify(story));
  const client = new Client({ name: "story-sdk-test", version: "1.0.0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [
        process.env.PARALLAX_TEST_CLI ??
          new URL("../dist/cli.js", import.meta.url).pathname,
        "mcp",
        "--root",
        root,
      ],
      stderr: "pipe",
    }),
  );
  try {
    const preview = await client.callTool({
      name: "parallax_create_preview",
      arguments: { recordPath: "story.json", outputPath: "stage.html" },
    });
    assert.ok(!preview.isError);
    const output = preview.structuredContent as any;
    story.preview = {
      revision: output.revision,
      file: "stage.html",
      fileDigest: output.digest,
    };
    story.approval = {
      revision: output.revision,
      previewDigest: output.digest,
      scope: "motion",
      decision: "approved",
      source: "human-message",
      evidence: "Synthetic SDK test evidence, not owner acceptance",
      approvedAt: "2026-10-04T01:00:00Z",
    };
    await writeFile(join(root, "story.json"), JSON.stringify(story));
    const validation = await client.callTool({
      name: "parallax_validate_project",
      arguments: { recordPath: "story.json" },
    });
    assert.equal(
      (validation.structuredContent as any).approvalStatus,
      "recorded",
    );
    const handoff = await client.callTool({
      name: "parallax_export_handoff",
      arguments: { recordPath: "story.json", outputPath: "handoff.md" },
    });
    assert.ok(!handoff.isError);
    assert.ok(
      (await readFile(join(root, "handoff.md"), "utf8")).includes(
        "Full-site UI is not approved",
      ),
    );
    await writeFile(join(root, "stage.html"), "changed");
    const stale = await client.callTool({
      name: "parallax_validate_project",
      arguments: { recordPath: "story.json" },
    });
    assert.equal((stale.structuredContent as any).approvalStatus, "stale");
  } finally {
    await client.close();
  }
});

test("creative and manual-video guidance serves fixed version 2 templates", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "story-guidance-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const client = new Client({ name: "guidance-test", version: "1.0.0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [
        process.env.PARALLAX_TEST_CLI ??
          new URL("../dist/cli.js", import.meta.url).pathname,
        "mcp",
        "--root",
        root,
      ],
      stderr: "pipe",
    }),
  );
  try {
    for (const phase of ["discovery", "concepts", "preview"]) {
      const result = await client.callTool({
        name: "parallax_design_guidance",
        arguments: { phase },
      });
      assert.equal(
        (result.structuredContent as any).templates["story.json"].schemaVersion,
        2,
      );
      assert.ok(/UI\/UX tool/.test((result.structuredContent as any).workflow));
    }
    const assets = await client.callTool({
      name: "parallax_design_guidance",
      arguments: { phase: "assets" },
    });
    assert.ok(
      (assets.structuredContent as any).templates["video-prompts.md"].includes(
        "No video MCP required",
      ),
    );
  } finally {
    await client.close();
  }
});
