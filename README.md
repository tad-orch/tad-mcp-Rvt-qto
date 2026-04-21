# TAD Revit Quantity Takeoff MCP Server

A Model Context Protocol (MCP) server for extracting detailed quantity takeoffs from Revit models. This server provides quantification tools for architectural, structural, and MEP (Mechanical, Electrical, Plumbing) elements, designed for integration with the Autodesk Design & Make Marketplace.

## Features

- **Architectural Quantification**: Walls, floors, ceilings, railings, and family instance counts
- **Structural Analysis**: Beams, columns, foundations, and concrete volume calculations
- **MEP Systems**: Pipes, ducts, cable trays, conduits, and component counts
- **Flexible Grouping**: Group results by type, level, system, or phase
- **Diameter Bucketing**: Optional pipe diameter range breakdown
- **Volume Calculations**: Support for both linear and volumetric metrics

## Tools

### Architectural (5 tools)
- `qto_walls` - Wall quantities (length, area, volume)
- `qto_floors` - Floor quantities (area, volume)
- `qto_ceilings` - Ceiling quantities (area)
- `qto_railings` - Railing quantities (linear meters)
- `qto_families_count` - Family instance counts by category/family/type/level

### Structural (4 tools)
- `qto_struct_beams` - Beam quantities (linear meters, volume)
- `qto_struct_columns` - Column quantities (linear meters, volume)
- `qto_struct_foundations` - Foundation counts and volumes
- `qto_struct_concrete` - Combined concrete volume analysis

### MEP Systems (13 tools)
- `qto_mep_pipes` - Pipe quantities with optional diameter bucketing
- `qto_mep_ducts` - Duct quantities with surface area
- `qto_mep_cabletrays` - Cable tray linear meters
- `qto_mep_conduits` - Conduit linear meters
- `qto_mep_duct_fittings_count` - Duct fittings count
- `qto_mep_air_terminals_count` - Air terminal counts
- `qto_mep_mechanical_equip_count` - Mechanical equipment counts
- `qto_mep_pipe_fittings_count` - Pipe fittings count
- `qto_mep_pipe_accessories_count` - Pipe accessories count
- `qto_mep_plumbing_equipment_count` - Plumbing equipment counts
- `qto_mep_plumbing_fixtures_count` - Plumbing fixture counts
- `qto_electrical_equipment_count` - Electrical equipment counts
- `qto_electrical_lighting_count` - Lighting fixture counts
- `qto_electrical_devices_count` - Electrical device counts

## Installation

```bash
git clone https://github.com/tad-orchestrator/tad-mcp-Rvt-qto.git
cd tad-mcp-Rvt-qto
npm install
```

## Configuration

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Set the Revit bridge URL (default is `http://127.0.0.1:55234/mcp`):

```
REVIT_BRIDGE_URL=http://127.0.0.1:55234/mcp
```

## Building

```bash
npm run build
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Integration with MCP Client

The server uses the Model Context Protocol (MCP) with stdio transport. Configure your MCP client to launch:

```json
{
  "mcpServers": {
    "tad-mcp-rvt-qto": {
      "command": "node",
      "args": ["/path/to/tad-mcp-rvt-qto/dist/index.js"],
      "env": {
        "REVIT_BRIDGE_URL": "http://127.0.0.1:55234/mcp"
      }
    }
  }
}
```

## Architecture

The server is organized into three tool modules:

- **bridge.ts** - Handles communication with the Revit bridge service
- **tools/architectural.ts** - Architectural quantification tools
- **tools/structural.ts** - Structural quantification tools
- **tools/mep.ts** - MEP systems quantification tools

Each tool validates input using Zod schemas and returns structured JSON responses with summary statistics.

## Response Format

All quantification tools return a consistent structure:

```json
{
  "data": [
    {
      "group": "Type A",
      "count": 42,
      "length_m": 150.5,
      "area_m2": 1250.0,
      "volume_m3": 625.0
    }
  ],
  "summary": {
    "total_count": 150,
    "total_length_m": 500.0,
    "total_area_m2": 5000.0,
    "total_volume_m3": 2500.0
  }
}
```

## Contributing

For issues, feature requests, or contributions, please refer to the project repository.

## License

Proprietary - Autodesk Design & Make Marketplace
