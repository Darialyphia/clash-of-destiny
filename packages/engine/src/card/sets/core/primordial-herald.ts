import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { OnEnterModifier } from '../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
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

export const primordialHerald: UnitBlueprint = {
  id: 'primordial-herald',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.GENESIS,
  name: 'Primordial Herald',
  getDescription: () => {
    return `@On Enter@: You may discard a card to summon a minion from your discard pile whose cost is less than or equal to the discarded card's cost, nearby this unit.`;
  },
  staticDescription: `@On Enter@: You may discard a card to summon a minion from your discard pile whose cost is less than or equal to the discarded card's cost.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-primordial-herald',
  spriteId: 'primordial-herald',
  spriteParts: {},
  rarity: RARITIES.LEGENDARY,
  collectable: true,
  manaCost: 6,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 2,
  maxHp: 7,
  job: CARD_JOBS.GUARDIAN,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit(game, card) {
    card.addModifier(
      new OnEnterModifier(game, card, event => {
        const genesisCardsInHand = card.player.cards.hand.filter(
          // c => c.affinity === AFFINITIES.GENESIS
          () => true
        );
        if (!genesisCardsInHand.length) {
          return;
        }

        game.interaction.startSelectingCards({
          choices: genesisCardsInHand,
          minChoices: 0,
          maxChoices: 1,
          player: card.player,
          onComplete(selectedCards) {
            if (!selectedCards.length) return;
            const [discardedCard] = selectedCards;
            const minionsInDiscardPile = Array.from(
              card.player.cards.discardPile.values()
            ).filter(
              card =>
                card.kind === CARD_KINDS.UNIT &&
                (card.manaCost ?? 0) <= (discardedCard.manaCost ?? 0)
            );
            if (!minionsInDiscardPile.length) return;

            game.interaction.startSelectingCards({
              choices: minionsInDiscardPile,
              minChoices: 1,
              maxChoices: 1,
              player: card.player,
              onComplete(selectedCards) {
                const [cardToSummon] = selectedCards;
                game.interaction.startSelectingTargets({
                  player: card.player,
                  getNextTarget(targets) {
                    if (targets.length) return null;
                    const nearby = game.boardSystem
                      .getNeighbors(event.data.affectedCells[0])
                      .filter(cell => cell.isWalkable && !cell.unit);

                    if (!nearby.length) return null;

                    return {
                      type: 'cell',
                      isElligible(point) {
                        return nearby.some(cell => cell.position.equals(point));
                      }
                    };
                  },
                  canCommit(targets) {
                    return targets.length > 0;
                  },
                  onComplete(targets) {
                    card.player.summonMinionFromCard(
                      cardToSummon as MinionCard,
                      targets[0].cell
                    );
                    card.player.cards.discard(discardedCard);
                  }
                });
              }
            });
          }
        });
      })
    );
  },
  onPlay() {}
};
