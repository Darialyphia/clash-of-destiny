import type { Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  aliases: (string | RegExp)[];
};

export const KEYWORDS = {
  LINEAGE: {
    id: 'lineage',
    name: 'Lineage',
    description:
      'This Hero must be leveled up from a previous hero with the same lineage or a shrine.',
    aliases: [/^[a-z\s]+\slineage+/]
  },
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
    description: 'Does something when this card enters the board when played from hand.',
    aliases: []
  },
  ON_ATTACK: {
    id: 'on-attack',
    name: 'On Attack',
    description: 'Does something when this card attacks another unit.',
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
    description: 'You can only have one copy of this card in your deck.',
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
  },
  CLASS_BONUS: {
    id: 'class-bonus',
    name: 'Class Bonus',
    description: "This card has a bonus effect if its class matches your hero's class.",
    aliases: []
  },
  DEFIANT: {
    id: 'defiant',
    name: 'Defiant(X)',
    description:
      "This unit cannot move, attack, or use abilities unles its owner's hero is at least level X.",
    aliases: [/defiant\([0-9]+\)/]
  },
  VIGILANT: {
    id: 'vigilant',
    name: 'Vigilant',
    description: 'This unit does not exhaust when counterattacking.',
    aliases: []
  },
  TRINKET: {
    id: 'trinket',
    name: 'Trinket',
    description: 'This artifact does not lose durability during your turn.',
    aliases: []
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
