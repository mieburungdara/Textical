/**
 * Element Templates Index
 * 
 * Central export point for all element templates.
 */

import { ElementTemplate, ElementType, ElementStatusEffect } from './Element.js';

// Import all element templates
import { neutral } from './neutral.js';
import { fire } from './fire.js';
import { water } from './water.js';
import { earth } from './earth.js';
import { wind } from './wind.js';
import { light } from './light.js';
import { dark } from './dark.js';

// ========== ELEMENT REGISTRY ==========

export const ELEMENT_TEMPLATES: Record<ElementType, ElementTemplate> = {
  [ElementType.NEUTRAL]: neutral,
  [ElementType.FIRE]: fire,
  [ElementType.WATER]: water,
  [ElementType.EARTH]: earth,
  [ElementType.WIND]: wind,
  [ElementType.LIGHT]: light,
  [ElementType.DARK]: dark,
};

// ========== RE-EXPORTS ==========

export { ElementType, ElementStatusEffect };
export type { ElementTemplate } from './Element.js';

// ========== CONVENIENCE FUNCTIONS ==========

export function getElementTemplate(type: ElementType): ElementTemplate {
  return ELEMENT_TEMPLATES[type];
}

export function getElementById(id: string): ElementTemplate | undefined {
  return Object.values(ELEMENT_TEMPLATES).find(e => e.id === id);
}

export function getAllElements(): ElementTemplate[] {
  return Object.values(ELEMENT_TEMPLATES);
}

// Re-export individual templates
export {
  neutral,
  fire,
  water,
  earth,
  wind,
  light,
  dark,
};
