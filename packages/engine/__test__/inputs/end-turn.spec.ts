import { test, describe, expect } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_TYPES } from '../../src/card/card.enums';
import { NotActivePlayerError, WrongGamePhaseError } from '../../src/input/input-errors';

describe('Input: end turn', () => {
  const setup = () => {
    const cardPool = {
      'test-general': makeTestUnitCardBlueprint({
        id: 'test-general',
        faction: FACTIONS.F1,
        unitType: UNIT_TYPES.GENERAL
      }),
      'test-minion': makeTestUnitCardBlueprint({
        id: 'test-minion',
        faction: FACTIONS.F1
      })
    };

    return testGameBuilder()
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
  };

  test('a player cannot end their turn during mulligan phase', () => {
    const { game, errors } = setup();

    game.dispatch({
      type: 'endTurn',
      payload: { playerId: 'p1' }
    });

    expect(errors[0]).toBeInstanceOf(WrongGamePhaseError);
  });

  test('a player cannot end the turn when they are not the active player', () => {
    const { game, errors, helpers } = setup();
    helpers.skipMulligan();

    game.dispatch({
      type: 'endTurn',
      payload: { playerId: 'p2' }
    });
    expect(errors[0]).toBeInstanceOf(NotActivePlayerError);
  });

  test('ending the turn switches the active player', () => {
    const { game, player2, helpers } = setup();
    helpers.skipMulligan();

    game.dispatch({
      type: 'endTurn',
      payload: { playerId: 'p1' }
    });
    expect(game.turnSystem.activePlayer).toBe(player2);
  });
});
