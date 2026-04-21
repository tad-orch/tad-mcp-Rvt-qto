import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { callBridge } from '../bridge.js';

const GroupBySchema = z.enum(['type', 'level', 'system']).default('type');

const QtoMepPipesInputSchema = z.object({
  groupBy: z.enum(['system', 'type', 'level']).default('system'),
  system: z.string().optional().describe('Piping system to filter by'),
  includeDiameterBucket: z.boolean().default(false).describe('Break down by diameter ranges'),
});

const QtoMepPipesResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      length_m: z.number(),
      diameter_bucket: z.string().optional(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
    total_length_m: z.number(),
  }),
});

const QtoMepDuctsInputSchema = z.object({
  groupBy: z.enum(['system', 'type', 'level']).default('system'),
  system: z.string().optional().describe('HVAC system to filter by'),
});

const QtoMepDuctsResponseSchema = z.object({
  data: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      length_m: z.number(),
      area_m2: z.number(),
    })
  ),
  summary: z.object({
    total_count: z.number(),
    total_length_m: z.number(),
    total_area_m2: z.number(),
  }),
});

const QtoMepCabletraysInputSchema = z.object({
  groupBy: GroupBySchema.optional(),
  level: z.string().optional().describe('Level to filter by'),
});

const QtoMepCabletraysResponseSchema = z.object({
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

const QtoMepConduitsInputSchema = z.object({
  groupBy: GroupBySchema.optional(),
  level: z.string().optional().describe('Level to filter by'),
});

const QtoMepConduitsResponseSchema = z.object({
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

const QtoCountResponseSchema = z.object({
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

const QtoSimpleGroupByInputSchema = z.object({
  groupBy: z.enum(['type', 'level', 'system']).default('type'),
});

export function registerMepTools(server: McpServer): void {
  server.tool(
    'qto_mep_pipes',
    'Returns pipe quantities in linear meters grouped by system, type, or level, with optional diameter bucket breakdown.',
    QtoMepPipesInputSchema.shape,
    async (args) => {
      const input = QtoMepPipesInputSchema.parse(args);
      const result = await callBridge('qto_mep_pipes', {
        groupBy: input.groupBy,
        system: input.system,
        includeDiameterBucket: input.includeDiameterBucket,
      });
      const validated = QtoMepPipesResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_mep_ducts',
    'Returns duct quantities in linear meters grouped by system, type, or level, including surface area estimates.',
    QtoMepDuctsInputSchema.shape,
    async (args) => {
      const input = QtoMepDuctsInputSchema.parse(args);
      const result = await callBridge('qto_mep_ducts', {
        groupBy: input.groupBy,
        system: input.system,
      });
      const validated = QtoMepDuctsResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_mep_cabletrays',
    'Returns cable tray quantities in linear meters grouped by type or level.',
    QtoMepCabletraysInputSchema.shape,
    async (args) => {
      const input = QtoMepCabletraysInputSchema.parse(args);
      const result = await callBridge('qto_mep_cabletrays', {
        groupBy: input.groupBy,
        level: input.level,
      });
      const validated = QtoMepCabletraysResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_mep_conduits',
    'Returns conduit quantities in linear meters grouped by type or level.',
    QtoMepConduitsInputSchema.shape,
    async (args) => {
      const input = QtoMepConduitsInputSchema.parse(args);
      const result = await callBridge('qto_mep_conduits', {
        groupBy: input.groupBy,
        level: input.level,
      });
      const validated = QtoMepConduitsResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_mep_duct_fittings_count',
    'Returns counts of duct fittings grouped by type or level.',
    QtoSimpleGroupByInputSchema.shape,
    async (args) => {
      const input = QtoSimpleGroupByInputSchema.parse(args);
      const result = await callBridge('qto_mep_duct_fittings_count', { groupBy: input.groupBy });
      const validated = QtoCountResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_mep_air_terminals_count',
    'Returns counts of air terminals grouped by type or level.',
    QtoSimpleGroupByInputSchema.shape,
    async (args) => {
      const input = QtoSimpleGroupByInputSchema.parse(args);
      const result = await callBridge('qto_mep_air_terminals_count', { groupBy: input.groupBy });
      const validated = QtoCountResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_mep_mechanical_equip_count',
    'Returns counts of mechanical equipment grouped by type or level.',
    QtoSimpleGroupByInputSchema.shape,
    async (args) => {
      const input = QtoSimpleGroupByInputSchema.parse(args);
      const result = await callBridge('qto_mep_mechanical_equip_count', { groupBy: input.groupBy });
      const validated = QtoCountResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_mep_pipe_fittings_count',
    'Returns counts of pipe fittings grouped by type or level.',
    QtoSimpleGroupByInputSchema.shape,
    async (args) => {
      const input = QtoSimpleGroupByInputSchema.parse(args);
      const result = await callBridge('qto_mep_pipe_fittings_count', { groupBy: input.groupBy });
      const validated = QtoCountResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_mep_pipe_accessories_count',
    'Returns counts of pipe accessories grouped by type or level.',
    QtoSimpleGroupByInputSchema.shape,
    async (args) => {
      const input = QtoSimpleGroupByInputSchema.parse(args);
      const result = await callBridge('qto_mep_pipe_accessories_count', { groupBy: input.groupBy });
      const validated = QtoCountResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_mep_plumbing_equipment_count',
    'Returns counts of plumbing equipment grouped by type or level.',
    QtoSimpleGroupByInputSchema.shape,
    async (args) => {
      const input = QtoSimpleGroupByInputSchema.parse(args);
      const result = await callBridge('qto_mep_plumbing_equipment_count', { groupBy: input.groupBy });
      const validated = QtoCountResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_mep_plumbing_fixtures_count',
    'Returns counts of plumbing fixtures grouped by type or level.',
    QtoSimpleGroupByInputSchema.shape,
    async (args) => {
      const input = QtoSimpleGroupByInputSchema.parse(args);
      const result = await callBridge('qto_mep_plumbing_fixtures_count', { groupBy: input.groupBy });
      const validated = QtoCountResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_electrical_equipment_count',
    'Returns counts of electrical equipment grouped by type or level.',
    QtoSimpleGroupByInputSchema.shape,
    async (args) => {
      const input = QtoSimpleGroupByInputSchema.parse(args);
      const result = await callBridge('qto_electrical_equipment_count', { groupBy: input.groupBy });
      const validated = QtoCountResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_electrical_lighting_count',
    'Returns counts of lighting fixtures grouped by type or level.',
    QtoSimpleGroupByInputSchema.shape,
    async (args) => {
      const input = QtoSimpleGroupByInputSchema.parse(args);
      const result = await callBridge('qto_electrical_lighting_count', { groupBy: input.groupBy });
      const validated = QtoCountResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );

  server.tool(
    'qto_electrical_devices_count',
    'Returns counts of electrical devices grouped by type or level.',
    QtoSimpleGroupByInputSchema.shape,
    async (args) => {
      const input = QtoSimpleGroupByInputSchema.parse(args);
      const result = await callBridge('qto_electrical_devices_count', { groupBy: input.groupBy });
      const validated = QtoCountResponseSchema.parse(result);
      return { content: [{ type: 'text', text: JSON.stringify(validated, null, 2) }] };
    }
  );
}
