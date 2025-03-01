import { test, describe, expect, vi } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_TYPES } from '../../src/card/card.enums';
import type { UnitCard } from '../../src/card/entities/unit-card.entity';
import { KEYWORDS } from '../../src/card/card-keyword';
import { DyingWishModifier } from '../../src/modifier/modifiers/dying-wish.modifier';

describe('Modifier: DyingWish', () => {
  const setup = () => {
    const dyingWishHandler = vi.fn();
    const cardPool = {
      'test-general': makeTestUnitCardBlueprint({
        id: 'test-general',
        faction: FACTIONS.F1,
        unitType: UNIT_TYPES.GENERAL
      }),
      'test-minion': makeTestUnitCardBlueprint({
        id: 'test-minion',
        faction: FACTIONS.F1,
        onInit(game, card) {
          card.addModifier(new DyingWishModifier(game, card, dyingWishHandler));
        }
      })
    };

    const game = testGameBuilder()
      .withOverrides({ cardPool })
      .withP1Deck({
        general: 'test-general',
        cards: Array.from({ length: 30 }, () => 'test-minion')
      })
      .withP2Deck({
        general: 'test-general',
        cards: Array.from({ length: 30 }, () => 'test-minion')
      })
      .build();

    game.helpers.skipMulligan();

    return { ...game, cardPool, dyingWishHandler };
  };

  test('A unit with dying wish should have the DyingWish Keyword', () => {
    const { cardPool, player1, helpers, game } = setup();

    const card = helpers.playGeneratedCardFromHand(
      player1,
      cardPool['test-minion'].id
    ) as UnitCard;

    game.interaction.addTarget({
      type: 'cell',
      cell: { x: player1.general.x + 1, y: player1.general.y }
    });

    expect(card.unit.keywords).toContain(KEYWORDS.DYING_WISH);
  });

  test('Dying wish should trigger when thr unit it is applied to is destroyed', () => {
    const { player1, helpers, cardPool, dyingWishHandler } = setup();

    const card = helpers.playGeneratedCardFromHand(player1, cardPool['test-minion'].id, {
      x: player1.general.x + 1,
      y: player1.general.y
    }) as UnitCard;
    card.unit.destroy(player1.general.card);

    expect(dyingWishHandler).toHaveBeenCalledTimes(1);
  });
});
