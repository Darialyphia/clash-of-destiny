import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { OnEnterModifier } from '../../../modifier/modifiers/on-enter.modifier';
import { ProvokeModifier } from '../../../modifier/modifiers/provoke.modifier';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import { floatingDestiny } from '../../abilities/floating-destiny';
import type { UnitBlueprint } from '../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  UNIT_KINDS
} from '../../card.enums';
import type { MinionCard } from '../../entities/minion-card.entity';
import { MinionFollowup } from '../../followups/minion.followup';

export const bubblySlime: UnitBlueprint = {
  id: 'bubbly-slime',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  name: 'Bubbly Slime',
  getDescription: () => {
    return `@On Enter@: If you have 3 or more destiny, draw a card.`;
  },
  staticDescription: ``,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-bubbly-slime',
  spriteId: 'bubbly-slime',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 2,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [floatingDestiny],
  atk: 1,
  maxHp: 1,
  job: CARD_JOBS.FIGHTER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit(game, card) {
    card.addModifier(
      new OnEnterModifier<MinionCard>(game, card, () => {
        if (card.player.destiny.current >= 3) {
          card.player.cards.draw(1);
        }
      })
    );
  },
  onPlay(game, card) {
    card.unit.addModifier(new ProvokeModifier(game, card));
  }
};
