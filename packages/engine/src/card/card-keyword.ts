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
  },
  DISARMED: {
    id: 'disarmed',
    name: 'Disarmed',
    description: 'Cannot attack. Lose 1 stack at the end of its turn.',
    aliases: []
  },
  PROVOKE: {
    id: 'provoke',
    name: 'Provoke',
    description:
      'Stops enemy minions and general from moving. They must attack this first.',
    aliases: ['provoke']
  },
  PROVOKED: {
    id: 'provoked',
    name: 'Provoked',
    description: 'Provoked - cannot move and must attack Provoker first.',
    aliases: []
  },
  LASTING_DESTINY: {
    id: 'lasting-destiny',
    name: 'Lasting Destiny',
    description: 'You can banish this card from your discard pile to gain 1 Destiny.',
    aliases: []
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
