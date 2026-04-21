import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { callBridge } from '../bridge.js';

const GroupBySchema = z.enum(['type', 'level', 'phase']).default('type');

const QtoWallsInputSchema = z.object({
  groupBy: GroupBySchema.optional(),
  phase: z.string().optional().describe('Phase name to filter by'),
});

const QtoWallsResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      length_m: z.number(),
      area_m2: z.number(),
      volume_m3: z.number().optional(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
    total_length_m: z.number(),
    total_area_m2: z.number(),
    total_volume_m3: z.number().optional(),
  }),
});

const QtoFloorsInputSchema = z.object({
  groupBy: GroupBySchema.optional(),
  level: z.string().optional().describe('Level name to filter by'),
});

const QtoFloorsResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      area_m2: z.number(),
      volume_m3: z.number().optional(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
    total_area_m2: z.number(),
    total_volume_m3: z.number().optional(),
  }),
});

const QtoCeilingsInputSchema = z.object({
  groupBy: GroupBySchema.optional(),
  level: z.string().optional().describe('Level name to filter by'),
});

const QtoCeilingsResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      area_m2: z.number(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
    total_area_m2: z.number(),
  }),
});

const QtoRailingsInputSchema = z.object({
  groupBy: GroupBySchema.optional(),
  level: z.string().optional().describe('Level name to filter by'),
});

const QtoRailingsResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      length_m: z.number(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
    total_length_m: z.number(),
  }),
});

const QtoFamiliesCountInputSchema = z.object({
  groupBy: z.enum(['category', 'family', 'type', 'level']).default('category'),
  category: z.string().optional().describe('Filter by category'),
  family: z.string().optional().describe('Filter by family name'),
  level: z.string().optional().describe('Filter by level'),
});

const QtoFamiliesCountResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
  }),
});

const QtoRoomsInputSchema = z.object({
  groupBy: z.enum(['level', 'type']).default('level'),
  level: z.string().optional().describe('Level name to filter by'),
});

const QtoRoomsResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      area_m2: z.number(),
      volume_m3: z.number().optional(),
      perimeter_m: z.number().optional(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
    total_area_m2: z.number(),
    total_volume_m3: z.number().optional(),
  }),
});

const QtoRoofsInputSchema = z.object({
  groupBy: z.enum(['type', 'level']).default('type'),
  level: z.string().optional().describe('Level name to filter by'),
});

const QtoRoofsResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      area_m2: z.number(),
      volume_m3: z.number().optional(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
    total_area_m2: z.number(),
    total_volume_m3: z.number().optional(),
  }),
});

export function registerArchitecturalTools(server: McpServer): void {
  server.tool(
    'qto_walls',
    'Returns wall quantities from the active Revit model grouped by type, level, or phase, including length, area, and volume metrics.',
    QtoWallsInputSchema.shape,
    async (args) => {
      const input = QtoWallsInputSchema.parse(args);
      const result = await callBridge('qto_walls', { groupBy: input.groupBy, phase: input.phase });
      const validated = QtoWallsResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_floors',
    'Returns floor quantities grouped by type or level, including area and volume.',
    QtoFloorsInputSchema.shape,
    async (args) => {
      const input = QtoFloorsInputSchema.parse(args);
      const result = await callBridge('qto_floors', { groupBy: input.groupBy, level: input.level });
      const validated = QtoFloorsResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_ceilings',
    'Returns ceiling quantities grouped by type or level, including area.',
    QtoCeilingsInputSchema.shape,
    async (args) => {
      const input = QtoCeilingsInputSchema.parse(args);
      const result = await callBridge('qto_ceilings', { groupBy: input.groupBy, level: input.level });
      const validated = QtoCeilingsResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_railings',
    'Returns railing quantities in linear meters grouped by type or level.',
    QtoRailingsInputSchema.shape,
    async (args) => {
      const input = QtoRailingsInputSchema.parse(args);
      const result = await callBridge('qto_railings', { groupBy: input.groupBy, level: input.level });
      const validated = QtoRailingsResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_families_count',
    'Returns counts of family instances in the model grouped by category, family, type, or level.',
    QtoFamiliesCountInputSchema.shape,
    async (args) => {
      const input = QtoFamiliesCountInputSchema.parse(args);
      const result = await callBridge('qto_families_count', {
        groupBy: input.groupBy,
        category: input.category,
        family: input.family,
        level: input.level,
      });
      const validated = QtoFamiliesCountResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_rooms',
    'Returns room quantities from the active Revit model grouped by level or type, including area, volume, and perimeter.',
    QtoRoomsInputSchema.shape,
    async (args) => {
      const input = QtoRoomsInputSchema.parse(args);
      const result = await callBridge('qto.rooms', { groupBy: input.groupBy, level: input.level });
      const validated = QtoRoomsResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_roofs',
    'Returns roof quantities grouped by type or level, including area and volume.',
    QtoRoofsInputSchema.shape,
    async (args) => {
      const input = QtoRoofsInputSchema.parse(args);
      const result = await callBridge('qto.roofs', { groupBy: input.groupBy, level: input.level });
      const validated = QtoRoofsResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );
}
