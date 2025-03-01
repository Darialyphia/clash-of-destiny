import { test, describe, expect, vi } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_TYPES } from '../../src/card/card.enums';
import type { UnitCard } from '../../src/card/entities/unit-card.entity';
import { KEYWORDS } from '../../src/card/card-keyword';
import { DeathwatchModifier } from '../../src/modifier/modifiers/deathwatch.modifier';

describe('Modifier: Deathwatch', () => {
  const setup = () => {
    const deathwatchHandler = vi.fn();
    const cardPool = {
      'test-general': makeTestUnitCardBlueprint({
        id: 'test-general',
        faction: FACTIONS.F1,
        unitType: UNIT_TYPES.GENERAL
      }),
      'test-minion': makeTestUnitCardBlueprint({
        id: 'test-minion',
        faction: FACTIONS.F1
      }),
      'test-minion-deathwatch': makeTestUnitCardBlueprint({
        id: 'test-minion-deathwatch',
        faction: FACTIONS.F1,
        onPlay(game, card) {
          card.unit.addModifier(new DeathwatchModifier(game, card, deathwatchHandler));
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

    return { ...game, cardPool, deathwatchHandler };
  };

  test('A unit with deathwatch should have the Deathwatch Keyword', () => {
    const { cardPool, player1, helpers, game } = setup();

    const card = helpers.playGeneratedCardFromHand(
      player1,
      cardPool['test-minion-deathwatch'].id
    ) as UnitCard;

    game.interaction.addTarget({
      type: 'cell',
      cell: { x: player1.general.x + 1, y: player1.general.y }
    });

    expect(card.unit.keywords).toContain(KEYWORDS.DEATHWATCH);
  });

  test('Deathwatch should trigger when a unit is destroyed', () => {
    const { player1, helpers, cardPool, deathwatchHandler } = setup();

    helpers.playGeneratedCardFromHand(player1, cardPool['test-minion-deathwatch'].id, {
      x: player1.general.x + 1,
      y: player1.general.y
    });
    const card = helpers.playGeneratedCardFromHand(player1, cardPool['test-minion'].id, {
      x: player1.general.x + 2,
      y: player1.general.y
    }) as UnitCard;

    card.unit.destroy(player1.general.card);

    expect(deathwatchHandler).toHaveBeenCalledTimes(1);
  });

  test('Deathwatch should not trigger when the unit its applied is destroyed', () => {
    const { player1, helpers, cardPool, deathwatchHandler } = setup();

    const card = helpers.playGeneratedCardFromHand(
      player1,
      cardPool['test-minion-deathwatch'].id,
      {
        x: player1.general.x + 1,
        y: player1.general.y
      }
    ) as UnitCard;
    card.unit.destroy(player1.general.card);

    expect(deathwatchHandler).not.toHaveBeenCalled();
  });
});
