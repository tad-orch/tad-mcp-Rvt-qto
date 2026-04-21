# Local Setup Guide — TAD Revit QTO MCP (Docker)

This guide is for architects and engineers who want to use AI assistants (Claude Desktop, Cursor) to query their **open Revit model** for quantity takeoffs.

---

## What this MCP does

Once connected, your AI assistant can answer questions like:

- *"How many linear meters of concrete walls are on Level 2?"*
- *"Give me a summary of pipe lengths by system."*
- *"What's the total floor area by type?"*
- *"How many electrical devices are on each level?"*

It does this by calling 24 tools that read data from the active Revit model through a local bridge service.

### Available tools

| # | Tool | What it measures |
|---|------|-----------------|
| 1 | `qto_walls` | Wall length (m), area (m²), volume (m³) |
| 2 | `qto_floors` | Floor area (m²) and volume (m³) |
| 3 | `qto_ceilings` | Ceiling area (m²) |
| 4 | `qto_railings` | Railing linear meters |
| 5 | `qto_families_count` | Any Revit family — count by category/type/level |
| 6 | `qto_struct_beams` | Structural beam lengths and volumes |
| 7 | `qto_struct_columns` | Column lengths and volumes |
| 8 | `qto_struct_foundations` | Foundation counts and volumes |
| 9 | `qto_struct_concrete` | Combined structural concrete totals |
| 10 | `qto_mep_pipes` | Pipe lengths, optional diameter breakdown |
| 11 | `qto_mep_ducts` | Duct lengths and surface areas |
| 12 | `qto_mep_cabletrays` | Cable tray linear meters |
| 13 | `qto_mep_conduits` | Conduit linear meters |
| 14 | `qto_mep_duct_fittings_count` | Duct fitting count |
| 15 | `qto_mep_air_terminals_count` | Air terminal count |
| 16 | `qto_mep_mechanical_equip_count` | Mechanical equipment count |
| 17 | `qto_mep_pipe_fittings_count` | Pipe fitting count |
| 18 | `qto_mep_pipe_accessories_count` | Pipe accessory count |
| 19 | `qto_mep_plumbing_equipment_count` | Plumbing equipment count |
| 20 | `qto_mep_plumbing_fixtures_count` | Plumbing fixture count |
| 21 | `qto_electrical_equipment_count` | Electrical equipment count |
| 22 | `qto_electrical_lighting_count` | Lighting fixture count |
| 23 | `qto_electrical_devices_count` | Electrical device count |

---

## Prerequisites

1. **Docker Desktop** installed and running — [download](https://www.docker.com/products/docker-desktop/)
2. **Revit 2025 or later** open with a model loaded
3. **TAD Bridge add-in** installed in Revit and running (exposes `http://localhost:55234/mcp`)

---

## Setup

### Step 1 — Build the Docker image

Clone the repo and build once:

```bash
git clone https://github.com/tad-orch/tad-mcp-Rvt-qto.git
cd tad-mcp-Rvt-qto
npm install
npm run build
docker build -t tad-mcp-rvt-qto .
```

Or, if a pre-built image is published:

```bash
docker pull tad-orch/tad-mcp-rvt-qto:latest
```

### Step 2 — Verify the bridge is reachable

With Revit open and the TAD Bridge running, test from your terminal:

```bash
curl -X POST http://localhost:55234/mcp \
  -H "Content-Type: application/json" \
  -d '{"action":"qto_walls","params":{}}'
```

You should receive a JSON response with wall data. If you get a connection error, make sure Revit is open and the TAD Bridge add-in is active.

### Step 3 — Configure Claude Desktop

Open `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows) and add:

```json
{
  "mcpServers": {
    "tad-mcp-rvt-qto": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "--add-host=host.docker.internal:host-gateway",
        "-e", "REVIT_BRIDGE_URL=http://host.docker.internal:55234/mcp",
        "tad-mcp-rvt-qto"
      ]
    }
  }
}
```

Restart Claude Desktop. You should see the MCP server listed in the tools panel.

### Step 4 — Configure Cursor

In Cursor settings → MCP, add a new server with type `stdio` and the same `docker run` command:

```json
{
  "name": "tad-mcp-rvt-qto",
  "command": "docker",
  "args": [
    "run", "--rm", "-i",
    "--add-host=host.docker.internal:host-gateway",
    "-e", "REVIT_BRIDGE_URL=http://host.docker.internal:55234/mcp",
    "tad-mcp-rvt-qto"
  ]
}
```

---

## How it works

```
Claude Desktop / Cursor
        │  stdio (JSON-RPC over stdin/stdout)
        ▼
  Docker container (tad-mcp-rvt-qto)
        │  HTTP POST to REVIT_BRIDGE_URL
        ▼
  TAD Bridge add-in (localhost:55234)
        │  Revit API calls
        ▼
  Active Revit model
```

The Docker container talks to Revit over HTTP. `host.docker.internal` is a special hostname that resolves to your host machine from inside the container — this is how the container reaches the bridge running on your Windows/Mac machine.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Connection refused` on port 55234 | Make sure Revit is open and the TAD Bridge add-in is loaded. Check the Revit ribbon for a "TAD Bridge" panel. |
| `Error: Bridge call failed` | The bridge is reachable but returned an error. Check that a model is open in Revit (not just the start screen). |
| Docker container exits immediately | Run `docker run --rm -i tad-mcp-rvt-qto` manually to see the error output. |
| `host.docker.internal` not resolving on Linux | Add `--add-host=host.docker.internal:host-gateway` to the docker run command (already included in the config above). |
| Tools not appearing in Claude | Restart Claude Desktop after editing the config file. Check the MCP log at `~/Library/Logs/Claude/` (macOS). |

---

## Updating

When a new version is released:

```bash
git pull
npm run build
docker build -t tad-mcp-rvt-qto .
```

No changes needed to your Claude Desktop or Cursor config.
