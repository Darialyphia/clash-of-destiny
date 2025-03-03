import { test, describe, expect } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_KINDS } from '../../src/card/card.enums';
import { GAME_PHASES } from '../../src/game/systems/game-phase.system';
import {
  AlreadyMulliganedError,
  TooManyMulliganedCardsError,
  WrongGamePhaseError
} from '../../src/input/input-errors';

describe('Input: mulligan', () => {
  const setup = () => {
    const cardPool = {
      'test-general': makeTestUnitCardBlueprint({
        id: 'test-general',
        faction: FACTIONS.F1,
        unitType: UNIT_KINDS.GENERAL
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

  test('game starts once both players have mulliganed', () => {
    const { game, helpers } = setup();
    helpers.skipMulligan();

    expect(game.gamePhaseSystem.phase).toBe(GAME_PHASES.BATTLE);
  });

  test('a player can only mulligan once', () => {
    const { game, player1, errors } = setup();

    game.dispatch({
      type: 'mulligan',
      payload: { indices: [], playerId: player1.id }
    });
    expect(player1.hasMulliganed).toBe(true);

    game.dispatch({
      type: 'mulligan',
      payload: { indices: [], playerId: player1.id }
    });
    expect(errors[0]).toBeInstanceOf(AlreadyMulliganedError);
  });

  test('a player can only mulligan up to 3 cards', () => {
    const { game, player1, errors } = setup();

    game.dispatch({
      type: 'mulligan',
      payload: { indices: [0, 1, 2, 3], playerId: player1.id }
    });
    expect(errors[0]).toBeInstanceOf(TooManyMulliganedCardsError);
  });

  test('a player cannot mulligan during battle phase', () => {
    const { game, player1, errors, helpers } = setup();
    helpers.skipMulligan();

    game.dispatch({
      type: 'mulligan',
      payload: { indices: [], playerId: player1.id }
    });
    expect(errors[0]).toBeInstanceOf(WrongGamePhaseError);
  });
});
