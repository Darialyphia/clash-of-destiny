import { test, describe, expect } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_TYPES } from '../../src/card/card.enums';
import {
  NotActivePlayerError,
  TooManyReplacesError,
  WrongGamePhaseError
} from '../../src/input/input-errors';

describe('Input: replace card', () => {
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

  test('a player cannot replace a card during mulligan phase', () => {
    const { game, errors } = setup();

    game.dispatch({
      type: 'replaceCard',
      payload: { playerId: 'p1', index: 0 }
    });

    expect(errors[0]).toBeInstanceOf(WrongGamePhaseError);
  });

  test('a player cannot replace a card when they are not the active player', () => {
    const { game, errors, helpers } = setup();
    helpers.skipMulligan();

    game.dispatch({
      type: 'replaceCard',
      payload: { playerId: 'p2', index: 0 }
    });

    expect(errors[0]).toBeInstanceOf(NotActivePlayerError);
  });

  test('a player cannot replace more than their amount of max replaces', () => {
    const { game, errors, helpers, player1 } = setup();
    helpers.skipMulligan();

    for (let i = 0; i < player1.maxReplaces + 1; i++) {
      game.dispatch({
        type: 'replaceCard',
        payload: { playerId: 'p1', index: 0 }
      });
    }

    expect(errors[0]).toBeInstanceOf(TooManyReplacesError);
  });
});
