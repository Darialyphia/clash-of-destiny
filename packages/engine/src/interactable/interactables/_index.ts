import { keyBy } from 'lodash-es';
import type { InteractableBlueprint } from '../interactable-blueprint';

export const OBSTACLES = keyBy([], 'id') as Record<string, InteractableBlueprint>;
