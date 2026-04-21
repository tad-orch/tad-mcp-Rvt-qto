import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { callBridge } from '../bridge.js';

const GroupBySchema = z.enum(['type', 'level', 'material']).default('type');

const QtoStructBeamsInputSchema = z.object({
  groupBy: GroupBySchema.optional(),
  level: z.string().optional().describe('Level name to filter by'),
  includeVolume: z.boolean().default(true).describe('Include volume calculations'),
});

const QtoStructBeamsResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      length_m: z.number(),
      volume_m3: z.number().optional(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
    total_length_m: z.number(),
    total_volume_m3: z.number().optional(),
  }),
});

const QtoStructColumnsInputSchema = z.object({
  groupBy: GroupBySchema.optional(),
  level: z.string().optional().describe('Level name to filter by'),
  includeVolume: z.boolean().default(true).describe('Include volume calculations'),
});

const QtoStructColumnsResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      length_m: z.number(),
      volume_m3: z.number().optional(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
    total_length_m: z.number(),
    total_volume_m3: z.number().optional(),
  }),
});

const QtoStructFoundationsInputSchema = z.object({
  groupBy: GroupBySchema.optional(),
  type: z.string().optional().describe('Foundation type to filter by'),
});

const QtoStructFoundationsResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      volume_m3: z.number(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
    total_volume_m3: z.number(),
  }),
});

const QtoStructConcreteInputSchema = z.object({
  includeLinearMeters: z.boolean().default(false).describe('Include linear meters for beams'),
});

const QtoStructRebarInputSchema = z.object({
  groupBy: z.enum(['diameter', 'level', 'type']).default('diameter'),
  level: z.string().optional().describe('Level name to filter by'),
  includeTotalWeight: z.boolean().default(true).describe('Include total weight in kg'),
});

const QtoStructRebarResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      total_length_m: z.number(),
      total_weight_kg: z.number().optional(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
    total_length_m: z.number(),
    total_weight_kg: z.number().optional(),
  }),
});

const QtoStructConcreteResponseSchema = z.object({
  data: z.object({
    beams: z.object({
      count: z.number(),
      length_m: z.number().optional(),
      volume_m3: z.number(),
    }),
    columns: z.object({
      count: z.number(),
      length_m: z.number().optional(),
      volume_m3: z.number(),
    }),
    foundations: z.object({
      count: z.number(),
      volume_m3: z.number(),
    }),
  }),
  summary: z.object({
    total_count: z.number(),
    total_volume_m3: z.number(),
  }),
});

export function registerStructuralTools(server: McpServer): void {
  server.tool(
    'qto_struct_beams',
    'Returns structural beam quantities grouped by type or level, including linear meters and optional volume.',
    QtoStructBeamsInputSchema.shape,
    async (args) => {
      const input = QtoStructBeamsInputSchema.parse(args);
      const result = await callBridge('qto_struct_beams', {
        groupBy: input.groupBy,
        level: input.level,
        includeVolume: input.includeVolume,
      });
      const validated = QtoStructBeamsResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_struct_columns',
    'Returns structural column quantities grouped by type or level, including linear meters and optional volume.',
    QtoStructColumnsInputSchema.shape,
    async (args) => {
      const input = QtoStructColumnsInputSchema.parse(args);
      const result = await callBridge('qto_struct_columns', {
        groupBy: input.groupBy,
        level: input.level,
        includeVolume: input.includeVolume,
      });
      const validated = QtoStructColumnsResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_struct_foundations',
    'Returns structural foundation counts and volumes grouped by type or level.',
    QtoStructFoundationsInputSchema.shape,
    async (args) => {
      const input = QtoStructFoundationsInputSchema.parse(args);
      const result = await callBridge('qto_struct_foundations', {
        groupBy: input.groupBy,
        type: input.type,
      });
      const validated = QtoStructFoundationsResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_struct_concrete',
    'Returns combined concrete volumes and linear meters for all structural concrete elements.',
    QtoStructConcreteInputSchema.shape,
    async (args) => {
      const input = QtoStructConcreteInputSchema.parse(args);
      const result = await callBridge('qto_struct_concrete', {
        includeLinearMeters: input.includeLinearMeters,
      });
      const validated = QtoStructConcreteResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_struct_rebar',
    'Returns rebar quantities grouped by diameter, level, or type, including total length and weight.',
    QtoStructRebarInputSchema.shape,
    async (args) => {
      const input = QtoStructRebarInputSchema.parse(args);
      const result = await callBridge('qto.struct.rebar', {
        groupBy: input.groupBy,
        level: input.level,
        includeTotalWeight: input.includeTotalWeight,
      });
      const validated = QtoStructRebarResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );
}
