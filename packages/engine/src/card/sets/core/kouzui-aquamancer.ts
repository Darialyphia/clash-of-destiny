import { CompositeAOEShape } from '../../../aoe/composite.aoe-shape';
import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { UnitSelfEventModifierMixin } from '../../../modifier/mixins/self-event.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
import { OnEnterModifier } from '../../../modifier/modifiers/on-enter.modifier';
import { SimpleAttackBuffModifier } from '../../../modifier/modifiers/simple-attack-buff.modifier';
import { UniqueModifier } from '../../../modifier/modifiers/unique.modifier';
import { VigilantModifier } from '../../../modifier/modifiers/vigilant.modifier';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import { UNIT_EVENTS } from '../../../unit/unit-enums';
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
import { AnywhereFollowup } from '../../followups/anywhere-followup';
import { MinionFollowup } from '../../followups/minion.followup';
import { MultiTargetFollowup } from '../../followups/multi-target-followup';

export const kouzuiAquamancer: UnitBlueprint = {
  id: 'kouzui-aquamancer',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  name: 'Kouzui, Aquamancer',
  getDescription: () => {
    return `@Unique@.\n@On Enter@: Put target minion on top of its owner's deck.`;
  },
  staticDescription: `@Unique@.\n@On Enter@: Put target minion on top of its owner's deck.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-kozui-aquamancer',
  spriteId: 'kozui-aquamancer',
  spriteParts: {},
  rarity: RARITIES.LEGENDARY,
  collectable: true,
  manaCost: 6,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  atk: 3,
  maxHp: 5,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [],
  getFollowup: (game, card) => {
    return new MultiTargetFollowup(game, card, [
      new MinionFollowup(),
      new AnywhereFollowup({ targetingType: TARGETING_TYPE.MINION, skippable: true })
    ]);
  },
  getAoe(game, card) {
    return new CompositeAOEShape([
      {
        shape: new PointAOEShape(game, card.player),
        getPoints(points) {
          return points;
        }
      },
      {
        shape: new PointAOEShape(game, card.player),
        getPoints(points) {
          return [points[1]];
        }
      }
    ]);
  },
  onInit(game, card) {
    card.addModifier(new UniqueModifier(game, card));
    card.addModifier(
      new OnEnterModifier(game, card, event => {
        const [, target] = event.data.affectedUnits; // first target is the minion being summoned
        if (target) {
          target.putOnTopOfDeck();
        }
      })
    );
  },
  onPlay() {}
};
