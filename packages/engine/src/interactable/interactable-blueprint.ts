import type { Game } from '../game/game';
import type { Interactable } from './interactable.entity';

export type InteractableBlueprint = {
  id: string;
  name: string;
  description: string;
  spriteId: string;
  iconId: string;
  walkable: boolean;
  attackable: boolean;
  onCreated?: (game: Game, interactable: Interactable) => void;
  onDestroyed?: (game: Game, interactable: Interactable) => void;
  onEnter?: (game: Game, interactable: Interactable) => void;
  onLeave?: (game: Game, interactable: Interactable) => void;
};
