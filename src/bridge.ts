import { fetch } from 'undici';
import { z } from 'zod';

const REVIT_BRIDGE_URL = process.env.REVIT_BRIDGE_URL || 'http://127.0.0.1:55234/mcp';

export interface BridgeRequest {
  action: string;
  params?: Record<string, unknown>;
}

export interface BridgeResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Call the Revit bridge with an action and optional parameters
 */
export async function callBridge<T = unknown>(
  action: string,
  params?: Record<string, unknown>
): Promise<T> {
  try {
    const response = await fetch(REVIT_BRIDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        params: params || {},
      } as BridgeRequest),
    });

    if (!response.ok) {
      throw new Error(`Bridge returned ${response.status}: ${response.statusText}`);
    }

    const result = (await response.json()) as BridgeResponse<T>;

    if (!result.success) {
      throw new Error(result.error || 'Bridge call failed');
    }

    return result.data as T;
  } catch (error) {
    throw new Error(
      `Bridge call failed (${action}): ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Parse and validate a schema against Zod
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
