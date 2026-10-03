# Recording approval

Present the exact regenerated wireframe and motion plan revision to the human. Only record a response that explicitly approves layout and motion. Capture the original decision or a reference to that human message; never fabricate it or use this template as evidence.

Add `preview` metadata using the create-preview response, then record:

```json
{
 "revision": "RETURNED_DESIGN_SHA256",
 "previewDigest": "RETURNED_PREVIEW_SHA256",
 "scope": ["layout", "motion"],
 "decision": "approved",
 "source": "human-message",
 "evidence": "ACTUAL_USER_DECISION_OR_MESSAGE_REFERENCE",
 "approvedAt": "ACTUAL_ISO_TIMESTAMP"
}
```

Place this object under `approval` in the project record. Run validation and export. Missing/stale approval requires renewed review. This record is auditable metadata, not authenticated human proof. Paid generation, final deployment and npm publishing require separate approvals.
