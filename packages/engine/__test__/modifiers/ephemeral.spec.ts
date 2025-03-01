import { test, describe, expect } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_TYPES } from '../../src/card/card.enums';
import type { UnitCard } from '../../src/card/entities/unit-card.entity';
import {
  BACKSTAB_EVENTS,
  BackstabModifier
} from '../../src/modifier/modifiers/backstab.modifier';
import { KEYWORDS } from '../../src/card/card-keyword';
import { GAME_EVENTS } from '../../src/game/game.events';
import { EphemeralModifier } from '../../src/modifier/modifiers/ephemeral.modifier';

describe('Modifier: Ephemeral', () => {
  const setup = () => {
    const cardPool = {
      'test-general': makeTestUnitCardBlueprint({
        id: 'test-general',
        faction: FACTIONS.F1,
        unitType: UNIT_TYPES.GENERAL,
        maxHp: 25
      }),
      'test-minion': makeTestUnitCardBlueprint({
        id: 'test-minion',
        faction: FACTIONS.F1,
        atk: 2,
        onPlay(game, card) {
          card.unit.addModifier(new EphemeralModifier(game, card));
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

    return {
      ...game,
      cardPool
    };
  };

  test('A unit with ephemeral should have the Ephemeral Keyword', () => {
    const { cardPool, player1, helpers, game } = setup();

    const card = helpers.playGeneratedCardFromHand(
      player1,
      cardPool['test-minion'].id
    ) as UnitCard;

    game.interaction.addTarget({
      type: 'cell',
      cell: { x: player1.general.x + 1, y: player1.general.y }
    });

    expect(card.unit.keywords).toContain(KEYWORDS.EPHEMERAL);
  });

  test('A unit with ephemeral should be removed from the board at the end of the turn', () => {
    const { cardPool, player1, helpers, game } = setup();

    const card = helpers.playGeneratedCardFromHand(player1, cardPool['test-minion'].id, {
      x: player1.general.x + 1,
      y: player1.general.y
    }) as UnitCard;

    player1.endTurn();

    expect(player1.units).not.toContain(card.unit);
  });

  test("A unit with ephemeral should be removed at the end of its owner's turn if it is summoned during the enemy turn", () => {
    const { cardPool, player1, player2, helpers } = setup();

    const card = helpers.playGeneratedCardFromHand(player2, cardPool['test-minion'].id, {
      x: player2.general.x - 1,
      y: player2.general.y
    }) as UnitCard;

    player1.endTurn();
    expect(player2.units).toContain(card.unit);

    player2.endTurn();
    expect(player2.units).not.toContain(card.unit);
  });
});
