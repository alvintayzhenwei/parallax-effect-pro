# Approved design handoff

Concept: Quiet depth

Revision: 820b9ce1c0ea9cfdd653ecf6038dcb0ed62cd056c1ace2c5f2c623a8d81e0223

Approval is recorded from human-message evidence; this file is not authenticated proof.

Decision evidence: SYNTHETIC FIXTURE ONLY: sample approval for demonstrating validation; not a real human decision.

Deployment: Requires executed quality checks and separate user approval

## Brief

Show a fictional design studio's work

Audience: Potential clients

Primary action: Explore services

## Sections

### Ideas with depth
A fictional studio exploring identity, digital spaces, and thoughtful motion.
Action: Explore our work #work

### Make room for the idea.
Form, rhythm, and space. Three fictional projects show how a clear idea becomes a memorable experience.
Action: View services #services

### Make the idea tangible
Identity, websites, and motion systems. This is a demonstration, not a real business.
Action: Back to introduction #hero

## Motion map

[
  {
    "sectionId": "hero",
    "effect": "layered-depth",
    "layers": [
      {
        "id": "sky",
        "label": "Background plane",
        "depth": "background",
        "direction": "vertical",
        "travel": 0.12
      },
      {
        "id": "shape",
        "label": "Midground shape",
        "depth": "midground",
        "direction": "vertical",
        "travel": 0.25
      },
      {
        "id": "frame",
        "label": "Foreground frame",
        "depth": "foreground",
        "direction": "vertical",
        "travel": 0.4
      }
    ]
  },
  {
    "sectionId": "work",
    "effect": "sticky-reveal",
    "layers": [
      {
        "id": "work-card",
        "label": "Work placeholder",
        "depth": "midground",
        "direction": "horizontal",
        "travel": 0.2
      }
    ]
  },
  {
    "sectionId": "services",
    "effect": "pointer-depth",
    "layers": [
      {
        "id": "service-shape",
        "label": "Decorative shape",
        "depth": "background",
        "direction": "horizontal",
        "travel": 0.15
      }
    ]
  }
]

Mobile: Reduce travel by half; keep native scrolling

Reduced motion: Static layers and fully visible content

## Asset plan

{
  "provider": "none",
  "mode": "import",
  "items": [
    {
      "id": "geometry",
      "purpose": "Preview depth layers",
      "status": "placeholder",
      "provenance": "Original geometric shapes"
    }
  ]
}

## Quality checks

Not run. No quality or deployment readiness claim.

## Build instructions

Preserve existing stack. Build the complete agreed website. Review draft copy and asset rights. Call separately connected Runway MCP only after paid-run approval. Do not publish without destination-specific approval.