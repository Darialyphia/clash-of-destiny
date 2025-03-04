import type { Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  aliases: (string | RegExp)[];
};

export const KEYWORDS = {
  ADAPT: {
    id: 'adapt',
    name: 'Adapt',
    description: 'When you play this card, choose one of multiple possible effects.',
    aliases: []
  },
  AIRDROP: {
    id: 'airdrop',
    name: 'Airdrop',
    description: 'Can be summoned anywhere.',
    aliases: []
  },
  BACKSTAB: {
    id: 'backstab',
    name: 'Backstab',
    description:
      'When attacking from behind, this deals extra damaged and cannot be counterattacked.',
    aliases: []
  },
  BATTLE_PET: {
    id: 'battlepet',
    name: 'Battle Pet',
    description:
      'This unit cannot be controlled. It moves and attacks the closest enemy at the start of your turn.',
    aliases: []
  },
  SHIELD: {
    id: 'barrier',
    name: 'Barrier',
    description: 'Prevents the next time this would be damaged or be destroyed.',
    aliases: []
  },
  BLAST: {
    id: 'blast',
    name: 'Blast',
    description:
      'Can attack any enemy in front, behind, above of below it. If it does, it attacks all enemies in that direction',
    aliases: []
  },
  BURN: {
    id: 'burn',
    name: 'Burn(x)',
    description: 'This unit x receives damage at the beginning of its turn.',
    aliases: [/burn\([0-9]+\)/]
  },
  CELERITY: {
    id: 'celerity',
    name: 'Celerity',
    description: 'Can activate twice per turn.',
    aliases: []
  },
  CLEANSE: {
    id: 'cleanse',
    name: 'Cleanse',
    description: 'Remove enchantments previously added from enemy sources.',
    aliases: []
  },
  DEATHWATCH: {
    id: 'deathwatch',
    name: 'Deathwatch',
    description: 'Triggers effect whenever a unit is destroyed.',
    aliases: []
  },
  DISCOVER: {
    id: 'discover',
    name: 'Discover',
    description: 'Choose one crd between 3 choices and add it to your hand.',
    aliases: []
  },
  DISPEL: {
    id: 'dispel',
    name: 'Dispel',
    description: 'Nullifies all abilities and enchantments previously added.',
    aliases: []
  },
  DYING_WISH: {
    id: 'dying_wish',
    name: 'Dying Wish',
    description: 'Triggers when the unit is destroyed.',
    aliases: []
  },
  ECHO: {
    id: 'echo',
    name: 'Echo',
    description:
      'When you play this card, put an Ephemeral copy of it in your hand without echo.',
    aliases: []
  },
  ELUSIVE: {
    id: 'elusive',
    name: 'Elusive',
    description:
      'The first time this is attacked each turn, this teleports behind the attacker if possible instead of counterattacking. If it does, this unit takes no damage from the attack.',
    aliases: []
  },
  EPHEMERAL: {
    id: 'ephemeral',
    name: 'Ephemeral',
    description: "This disappears at the end of its owner's turn.",
    aliases: []
  },
  ESSENCE: {
    id: 'essence',
    name: 'Essence',
    description:
      "If you don't have enough gold, you can play this minion as a spell by paying its essence cost instead.",
    aliases: [/essence\([0-9]+\)/]
  },
  FEARSOME: {
    id: 'fearsome',
    name: 'Fearsome',
    description:
      "When this unit attacks a minion and destroys it, it doesn't counterattack.",
    aliases: []
  },
  FLYING: {
    id: 'flying',
    name: 'Flying',
    description: 'can move anywhere on the battlefield.',
    aliases: []
  },
  FRENZY: {
    id: 'frenzy',
    name: 'Frenzy',
    description:
      'When attacking a nearby enemy, deal its attack damage to other nearby enemies.',
    aliases: ['frenzy']
  },
  FROZEN: {
    id: 'frozen',
    name: 'Frozen',
    description: 'This unit skips its next action.',
    aliases: ['freeze']
  },
  GROW: {
    id: 'grow',
    name: 'Grow',
    description: 'This unit gains attack and hp at the starts of its turn.',
    aliases: []
  },
  INFILTRATE: {
    id: 'infiltrate',
    name: 'Infiltrate',
    description:
      "Has an additional effect when on the opponent's side of the battlefield",
    aliases: []
  },
  LONE_WOLF: {
    id: 'lone_wolf',
    name: 'Lone wolf',
    description: 'Triggers when this unit has no nearby allies.',
    aliases: []
  },
  OPENING_GAMBIT: {
    id: 'opening_gambit',
    name: 'Opening Gambit',
    description: 'Triggers when the unit enters the battlefield.',
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
  RANGED: {
    id: 'ranged',
    name: 'Ranged',
    description: 'Can attack any enemy regardless of distance.',
    aliases: []
  },
  REBIRTH: {
    id: 'rebirth',
    name: 'Rebirth',
    description:
      'When destroyed, summon an egg on this space that hatches into a copy of it at the end of your next turn.',
    aliases: []
  },
  RUSH: {
    id: 'rush',
    name: 'Rush',
    description: 'This unit activates the turn it is summoned.',
    aliases: []
  },
  SLAY: {
    id: 'slay',
    name: 'Slay',
    description: 'Triggers when this unit destroys another one.',
    aliases: []
  },
  SPAWN: {
    id: 'spawn',
    name: 'Spawn',
    description:
      'Pick a space when this unit is summoned. At the start of your turn, summon a unit on this space, or deal 2 damage if an enemy unit is standing on it.',
    aliases: []
  },
  STRUCTURE: {
    id: 'structure',
    name: 'Structure',
    aliases: [],
    description: 'Cannot move, attack, retaliate or gain attack.'
  },
  STUNNED: {
    id: 'stunned',
    name: 'Stunned',
    description: 'This unit skips it next turn.',
    aliases: ['stun']
  },
  TIMELESS: {
    id: 'timeless',
    name: 'Timeless',
    aliases: [],
    description: 'This cannot lose durability during your turn.'
  },
  VEIL: {
    id: 'veil',
    name: 'Veil',
    description: 'Cannot be targeted by spells',
    aliases: []
  },
  WALL: {
    id: 'wall',
    name: 'Wall',
    description: 'Cannot move. Disappear when dispelled.',
    aliases: []
  },
  ZEAL: {
    id: 'zeal',
    name: 'Zeal',
    description: 'Triggers an effect when nearby its general.',
    aliases: []
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
