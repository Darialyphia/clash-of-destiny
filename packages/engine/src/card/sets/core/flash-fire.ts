import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { SecretBlueprint } from '../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../card.enums';
import { AnywhereFollowup } from '../../followups/anywhere-followup';
import { PureDamage } from '../../../combat/damage';
import { GAME_EVENTS } from '../../../game/game.events';

export const flashfire: SecretBlueprint = {
  id: 'flashfire',
  kind: CARD_KINDS.SECRET,
  affinity: AFFINITIES.FIRE,
  name: 'Flash Fire',
  getDescription: () => {
    return `@Secret@: When your hero is attacked, deal 2 damage to the attacker.`;
  },
  staticDescription: `@Secret@: When your hero is attacked, deal 2 damage to the attacker.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'secret-flashfire',
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 2,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [],
  getFollowup: () => {
    return new AnywhereFollowup({ targetingType: TARGETING_TYPE.ALLY_HERO });
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    const stop = game.on(GAME_EVENTS.UNIT_AFTER_ATTACK, event => {
      const target = game.unitSystem.getUnitAt(event.data.event.target);
      if (!target) return;
      if (!target.equals(card.player.hero)) return;

      card.trigger(() => {
        event.data.unit.takeDamage(card, new PureDamage({ source: card, baseAmount: 2 }));
        stop();
      });
    });
  }
};
