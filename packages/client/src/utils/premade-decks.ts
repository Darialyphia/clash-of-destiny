import type { GameOptions } from '@game/engine/src/game/game';

export const premadeDecks: Array<{
  name: string;
  heroes: GameOptions['players'][number]['heroes'];
}> = [];
