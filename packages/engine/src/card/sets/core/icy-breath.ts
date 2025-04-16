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
import { floatingDestiny } from '../../abilities/floating-destiny';
import { FrozenModifier } from '../../../modifier/modifiers/frozen-modifier';

export const icyBreath: SecretBlueprint = {
  id: 'icy-breath',
  kind: CARD_KINDS.SECRET,
  affinity: AFFINITIES.WATER,
  name: 'Icy Breath',
  getDescription: () => {
    return `@Secret@: When a minion that costs 3 or more is summoned, @Freeze@ it.`;
  },
  staticDescription: `@Secret@: When a minion that costs 3 or more is summoned, @Freeze@ it.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'secret-icy-breath',
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 2,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [floatingDestiny],
  getFollowup: () => {
    return new AnywhereFollowup({ targetingType: TARGETING_TYPE.ALLY_HERO });
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    const stop = game.on(GAME_EVENTS.UNIT_CREATED, event => {
      if (event.data.unit.player.equals(card.player)) return;
      if ((event.data.unit.card.manaCost ?? 0) < 3) return;
      card.trigger(() => {
        event.data.unit.addModifier(new FrozenModifier(game, card));
        stop();
      });
    });
  }
};
