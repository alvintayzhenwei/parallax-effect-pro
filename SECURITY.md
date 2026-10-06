# Security reporting and boundaries

Do not publish credentials, private assets or exploit material in public issues. For a vulnerability, contact the repository owner through an existing private GitHub channel or private vulnerability reporting if enabled. Include affected version, minimal fictional reproduction and impact. Do not invent a contact address or assume private-reporting features are enabled.

The CLI/MCP acts within an explicitly selected trusted local root. It rejects traversal, symlink components and overwrites; it is not a sandbox against malicious concurrent local processes. Host filesystem/approval controls remain authoritative. No generic shell/network/provider proxy tools are exposed.

Approval metadata is an auditable workflow record, not authentication. A malicious agent can falsify local files; the skill must only record actual human decisions. Runway authentication belongs to the separately connected provider MCP. Keys, tokens and recovery material must never enter project records, logs, prompts or packages.

Use `npm audit`, the behavior tests and package allowlist before release. GitHub security services depend on private-repository feature eligibility; only executed results establish a passed scan.
