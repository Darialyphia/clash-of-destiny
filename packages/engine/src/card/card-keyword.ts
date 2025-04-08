import type { Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  aliases: (string | RegExp)[];
};

export const KEYWORDS = {
  PROVOKE: {
    id: 'provoke',
    name: 'Provoke',
    description:
      'Stops nearby enemy minions and general from moving. They must attack this first.',
    aliases: ['provoke']
  },
  PROVOKED: {
    id: 'provoked',
    name: 'Provoked',
    description: 'Provoked - cannot move and must attack Provoker first.',
    aliases: []
  },
  FLOATING_DESTINY: {
    id: 'lasting-destiny',
    name: 'Floating Destiny',
    description: 'You can banish this card from your discard pile to gain 1 Destiny.',
    aliases: []
  },
  ON_ENTER: {
    id: 'on-enter',
    name: 'On Enter',
    description: 'Does something when this card enters the board when played from hand..',
    aliases: []
  },
  RANGED: {
    id: 'ranged',
    name: 'Ranged(x)',
    description:
      'This unit can attack unit up to X tiles away, but cannot attack nearby enemies.',
    aliases: [/ranged\([0-9]+\)/]
  },
  UNIQUE: {
    id: 'unique',
    name: 'Unique',
    description: 'You can only have copy of this card in your deck.',
    aliases: []
  },
  FLANK: {
    id: 'flank',
    name: 'Flank',
    description: 'This unit can be played on spaces nearby ally units.',
    aliases: []
  },
  SWIFT: {
    id: 'swift',
    name: 'Swift',
    description: 'This unit can move twice during a turn.',
    aliases: []
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
