import type { Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  aliases: (string | RegExp)[];
};

export const KEYWORDS = {
  ROOTED: {
    id: 'rooted',
    name: 'Rooted',
    description: 'Cannot move. Lose 1 stack at the end of its turn.',
    aliases: []
  },
  SILENCED: {
    id: 'silenced',
    name: 'Silenced',
    description: 'Cannot use Ability cards. Lose 1 stack at the end of its turn.',
    aliases: []
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
