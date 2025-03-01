import { test, describe, expect, vi } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_TYPES } from '../../src/card/card.enums';
import type { UnitCard } from '../../src/card/entities/unit-card.entity';
import { KEYWORDS } from '../../src/card/card-keyword';
import { AirdropModifier } from '../../src/modifier/modifiers/airdrop.modifier';
import { IllegalTargetError } from '../../src/input/input-errors';

describe('Modifier: Airdrop', () => {
  const setup = () => {
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
          card.addModifier(new AirdropModifier(game, card));
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

    return { ...game, cardPool };
  };

  test('Airdrop should allow the unit to be played on any empty space', () => {
    const { game, player1, helpers, cardPool, errors } = setup();

    const card = helpers.playGeneratedCardFromHand(
      player1,
      cardPool['test-minion'].id
    ) as UnitCard;

    game.interaction.addTarget({
      type: 'cell',
      cell: { x: 5, y: 5 }
    });

    expect(errors.length).toBe(0);
    expect(card.unit).toBeDefined();
    expect(card.unit.x).toBe(5);
    expect(card.unit.y).toBe(5);
  });

  test("Airdrop shouldn't allow the unit to be played on a non-empty space", () => {
    const { game, player1, player2, helpers, cardPool } = setup();

    const card = helpers.playGeneratedCardFromHand(
      player1,
      cardPool['test-minion'].id
    ) as UnitCard;

    expect(() => {
      game.interaction.addTarget({
        type: 'cell',
        cell: { x: player2.general.x, y: player2.general.y }
      });
    }).toThrowError(IllegalTargetError);
    expect(card.unit).toBeUndefined();
  });

  test('A unit with airdrop should have the Airdrop Keyword', () => {
    const { cardPool, player1, helpers, game } = setup();

    const card = helpers.playGeneratedCardFromHand(
      player1,
      cardPool['test-minion'].id
    ) as UnitCard;

    game.interaction.addTarget({
      type: 'cell',
      cell: { x: player1.general.x + 1, y: player1.general.y }
    });

    expect(card.unit.keywords).toContain(KEYWORDS.AIRDROP);
  });
});
