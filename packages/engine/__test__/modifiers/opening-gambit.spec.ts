import { test, describe, expect, vi } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_TYPES } from '../../src/card/card.enums';
import { OpeningGambitModifier } from '../../src/modifier/modifiers/opening-gambit.modifier';
import type { UnitCard } from '../../src/card/entities/unit-card.entity';
import { KEYWORDS } from '../../src/card/card-keyword';

describe('Modifier: OpeningGambit', () => {
  const setup = () => {
    const openingGambitHandler = vi.fn();
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
          card.addModifier(new OpeningGambitModifier(game, card, openingGambitHandler));
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

    return { ...game, cardPool, openingGambitHandler };
  };

  test('Opening Gambit should trigger when the card is played from hand', () => {
    const { player1, helpers, cardPool, openingGambitHandler } = setup();

    helpers.playGeneratedCardFromHand(player1, cardPool['test-minion'].id, {
      x: player1.general.x + 1,
      y: player1.general.y
    });

    expect(openingGambitHandler).toHaveBeenCalled();
  });

  test('Opening Gambit should not trigger when the unit is summoned without being played from hand', () => {
    const { player1, cardPool, openingGambitHandler } = setup();

    player1.summonUnitFromBlueprint(cardPool['test-minion'], {
      x: player1.general.x + 1,
      y: player1.general.y
    });

    expect(openingGambitHandler).not.toHaveBeenCalled();
  });

  test('A unit with opening gambit should have the Opening Gambit Keyword', () => {
    const { cardPool, player1, helpers, game } = setup();

    const card = helpers.playGeneratedCardFromHand(
      player1,
      cardPool['test-minion'].id
    ) as UnitCard;

    game.interaction.addTarget({
      type: 'cell',
      cell: { x: player1.general.x + 1, y: player1.general.y }
    });

    expect(card.unit.keywords).toContain(KEYWORDS.OPENING_GAMBIT);
  });
});
