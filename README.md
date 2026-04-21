# TAD Revit Quantity Takeoff — MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) server that exposes **24 QTO tools** for Revit models, designed for the Autodesk Design & Make Marketplace.

AI assistants (Claude, Cursor, etc.) can call these tools to extract wall areas, beam volumes, pipe lengths, fixture counts, and more — directly from the active Revit model via a lightweight local bridge.

---

## Two deployment modes

| Mode | Transport | Best for |
|------|-----------|----------|
| **Local (Docker)** | `stdio` | End users on Windows/Mac with Revit installed |
| **Cloud (Lambda)** | HTTP / StreamableHTTP | SaaS integrations, remote access |

- **Local mode**: Claude Desktop or Cursor launches a Docker container. The container calls a bridge running inside Revit on `localhost:55234`. No cloud required.
- **Cloud mode**: An Express server handles HTTP `POST /mcp` requests using `StreamableHTTPServerTransport`. Deploy to AWS Lambda or any Node.js host.

See [README-LOCAL.md](./README-LOCAL.md) for the step-by-step Docker setup guide.

---

## Tools (24 total)

### Architectural (5)
| Tool | Returns |
|------|---------|
| `qto_walls` | Length (m), area (m²), volume (m³) grouped by type / level / phase |
| `qto_floors` | Area (m²), volume (m³) grouped by type / level |
| `qto_ceilings` | Area (m²) grouped by type / level |
| `qto_railings` | Linear meters grouped by type / level |
| `qto_families_count` | Instance counts grouped by category / family / type / level |

### Structural (4)
| Tool | Returns |
|------|---------|
| `qto_struct_beams` | Linear meters + volume (m³) grouped by type / level / material |
| `qto_struct_columns` | Linear meters + volume (m³) grouped by type / level / material |
| `qto_struct_foundations` | Count + volume (m³) grouped by type / level |
| `qto_struct_concrete` | Combined concrete volumes for beams, columns, foundations |

### MEP & Electrical (15)
| Tool | Returns |
|------|---------|
| `qto_mep_pipes` | Linear meters, optional diameter-bucket breakdown |
| `qto_mep_ducts` | Linear meters + surface area (m²) |
| `qto_mep_cabletrays` | Linear meters |
| `qto_mep_conduits` | Linear meters |
| `qto_mep_duct_fittings_count` | Count |
| `qto_mep_air_terminals_count` | Count |
| `qto_mep_mechanical_equip_count` | Count |
| `qto_mep_pipe_fittings_count` | Count |
| `qto_mep_pipe_accessories_count` | Count |
| `qto_mep_plumbing_equipment_count` | Count |
| `qto_mep_plumbing_fixtures_count` | Count |
| `qto_electrical_equipment_count` | Count |
| `qto_electrical_lighting_count` | Count |
| `qto_electrical_devices_count` | Count |

---

## Response format

All tools return the same shape:

```json
{
  "data": [
    { "group": "Concrete Wall 200mm", "count": 42, "length_m": 150.5, "area_m2": 1250.0 }
  ],
  "summary": {
    "total_count": 150,
    "total_length_m": 500.0,
    "total_area_m2": 5000.0
  }
}
```

---

## Development

```bash
npm install
npm run dev:local   # stdio mode
npm run dev:http    # HTTP mode on port 3000
npm run build       # compile to dist/
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REVIT_BRIDGE_URL` | `http://127.0.0.1:55234/mcp` | Address of the Revit bridge |
| `PORT` | `3000` | HTTP server port (cloud mode only) |

---

## Deployment

### Local (Docker)
See [README-LOCAL.md](./README-LOCAL.md).

### Cloud (AWS Lambda)
Push to `main` — the GitHub Actions workflow in `.github/workflows/deploy.yml` builds, zips, and deploys automatically.

Requires repository secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

---

## Architecture

```
Claude / Cursor
     │  stdio or HTTP/MCP
     ▼
server.stdio.ts  OR  server.http.ts
     │
register-tools.ts  (architectural + structural + mep)
     │
bridge.ts  ──►  Revit Bridge (localhost:55234)  ──►  Revit API
```

---

## License

Proprietary — Autodesk Design & Make Marketplace
