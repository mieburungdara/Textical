/**
 * Generic Registry Helper
 * 
 * Provides reusable functions for filtering registries by property values.
 * Reduces code duplication from repeated Object.values().filter() patterns.
 */

import logger from './logger.js';

/**
 * Generic function to get all items from a registry
 */
export function getAllItems<T>(registry: Record<string, T>): T[] {
  return Object.values(registry);
}

/**
 * Generic function to get a single item by ID
 */
export function getItemById<T>(registry: Record<string, T>, id: string): T | undefined {
  return registry[id];
}

/**
 * Generic function to filter registry by a property value
 */
export function getItemsByProperty<T>(
  registry: Record<string, T>,
  property: keyof T,
  value: any
): T[] {
  try {
    return Object.values(registry).filter(item => item[property] === value);
  } catch (error) {
    logger.error('[getItemsByProperty] Error filtering registry', { 
      property: String(property), 
      value,
      error: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}

/**
 * Generic function to filter registry by multiple property values (AND logic)
 */
export function getItemsByProperties<T>(
  registry: Record<string, T>,
  conditions: Partial<Record<keyof T, any>>
): T[] {
  try {
    return Object.values(registry).filter(item => {
      return Object.entries(conditions).every(([key, value]) => item[key as keyof T] === value);
    });
  } catch (error) {
    logger.error('[getItemsByProperties] Error filtering registry', { 
      conditions,
      error: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}

/**
 * Generic function to get items where a property contains a value (for arrays)
 */
export function getItemsWherePropertyContains<T>(
  registry: Record<string, T>,
  property: keyof T,
  value: any
): T[] {
  try {
    return Object.values(registry).filter(item => {
      const propValue = item[property];
      if (Array.isArray(propValue)) {
        return propValue.includes(value);
      }
      return false;
    });
  } catch (error) {
    logger.error('[getItemsWherePropertyContains] Error filtering registry', { 
      property: String(property), 
      value,
      error: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}

/**
 * Generic function to get all unique values of a property
 */
export function getUniquePropertyValues<T>(registry: Record<string, T>, property: keyof T): any[] {
  try {
    const values = Object.values(registry).map(item => item[property]);
    return [...new Set(values)];
  } catch (error) {
    logger.error('[getUniquePropertyValues] Error getting unique values', { 
      property: String(property),
      error: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}

/**
 * Generic function to count items by property value
 */
export function countItemsByProperty<T>(
  registry: Record<string, T>,
  property: keyof T
): Record<string, number> {
  try {
    const items = Object.values(registry);
    const counts: Record<string, number> = {};
    
    for (const item of items) {
      const key = String(item[property]);
      counts[key] = (counts[key] || 0) + 1;
    }
    
    return counts;
  } catch (error) {
    logger.error('[countItemsByProperty] Error counting items', { 
      property: String(property),
      error: error instanceof Error ? error.message : String(error)
    });
    return {};
  }
}

/**
 * Generic function to get all IDs from a registry
 */
export function getAllIds(registry: Record<string, any>): string[] {
  return Object.keys(registry);
}
