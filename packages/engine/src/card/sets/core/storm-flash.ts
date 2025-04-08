import { CompositeAOEShape } from '../../../aoe/composite.aoe-shape';
import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../card.enums';
import { AnywhereFollowup } from '../../followups/anywhere-followup';
import { MultiTargetFollowup } from '../../followups/multi-target-followup';
import { RangedFollowup } from '../../followups/ranged-followup';

export const stormFlash: SpellBlueprint = {
  id: 'storm-flash',
  kind: CARD_KINDS.SPELL,
  affinity: 'NORMAL',
  name: 'Storm Flash',
  getDescription: (game, card) => {
    return `Teleport a minion up to @[value] ${1 + card.player.hero.spellpower}@ spaces away.`;
  },
  staticDescription: `Teleport a unit up to @[spellpower]@ + 1 spaces away.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-storm-flash',
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 1,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [],
  getFollowup: (game, card) => {
    return new MultiTargetFollowup(game, card, [
      new AnywhereFollowup({ targetingType: TARGETING_TYPE.MINION }),
      new RangedFollowup({
        minRange: 0,
        maxRange: 1 + card.player.hero.spellpower,
        targetingType: TARGETING_TYPE.EMPTY,
        position: targets => targets[0].cell,
        allowSelf: false
      })
    ]);
  },
  getAoe(game, card, points) {
    return new CompositeAOEShape(
      points.map(pt => ({
        shape: new PointAOEShape(game, card.player, TARGETING_TYPE.ANYWHERE),
        getPoints() {
          return [pt];
        }
      }))
    );
  },
  onInit() {},
  onPlay(game, card, affectedCells, affectedUnits) {
    console.log(affectedCells, affectedUnits);
    const [target] = affectedUnits;
    if (!target) return;
    const [, targetCell] = affectedCells;
    if (!targetCell) return;
    target.teleport(targetCell.position);
  }
};
