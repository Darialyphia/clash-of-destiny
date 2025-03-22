import { Vec2 } from '@game/shared';
import { CrossAOEShape } from '../../../../aoe/cross.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { SelfFollowup } from '../../../followups/self-followup';
import { mage } from '../heroes/mage';

export const forceWave: AbilityBlueprint = {
  id: 'force-wave',
  name: 'Force Wave',
  getDescription() {
    return 'Knock back adjacent enemies 1 tile';
  },
  cardIconId: 'placeholder',
  rarity: RARITIES.COMMON,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ABILITY,
  manaCost: 2,
  levelCost: 1,
  exp: 1,
  classIds: [mage.id],
  getFollowup() {
    return new SelfFollowup();
  },
  getAoe(game, card) {
    return new CrossAOEShape(game, card.unit.player, {
      range: 1,
      targetingType: TARGETING_TYPE.ENEMY
    });
  },
  onPlay(game, card, cells, targets) {
    targets.forEach(target => {
      const vector = Vec2.sub(target.position, card.unit.position);
      vector.magnitude = 1;
      const spacesToPush = 1;
      let newPosition = target.position;

      for (let i = 0; i < spacesToPush; i++) {
        const nextCell = game.boardSystem.getCellAt(Vec2.add(target.position, vector));
        if (!nextCell || !nextCell.isWalkable || nextCell.unit) {
          break;
        }
        newPosition = nextCell.position;
      }

      target.teleport(newPosition);
    });
  }
};
