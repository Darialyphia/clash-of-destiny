import { test, describe, expect } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_TYPES } from '../../src/card/card.enums';
import {
  IllegalTargetError,
  InvalidInteractionStateError,
  NotActivePlayerError,
  WrongGamePhaseError
} from '../../src/input/input-errors';
import { healingMystic } from '../../src/card/sets/core/neutral/healing-mystic';

describe('Input: add card target', () => {
  const setup = () => {
    const cardPool = {
      'test-general': makeTestUnitCardBlueprint({
        id: 'test-general',
        faction: FACTIONS.F1,
        unitType: UNIT_TYPES.GENERAL
      }),
      [healingMystic.id]: healingMystic,
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

  test('a player cannot add a card target during mulligan phase', () => {
    const { game, errors } = setup();

    game.dispatch({
      type: 'addCardTarget',
      payload: { playerId: 'p1', x: 0, y: 0 }
    });

    expect(errors[0]).toBeInstanceOf(WrongGamePhaseError);
  });

  test('a player cannot add a card target when the game is not in select target interaction mode', () => {
    const { game, errors, helpers } = setup();
    helpers.skipMulligan();

    game.dispatch({
      type: 'addCardTarget',
      payload: { playerId: 'p1', x: 0, y: 0 }
    });

    expect(errors[0]).toBeInstanceOf(InvalidInteractionStateError);
  });

  test('a player cannot add a card target when it is not their turn', () => {
    const { game, errors, helpers, player1 } = setup();
    helpers.skipMulligan();

    helpers.playGeneratedCardFromHand(player1, healingMystic.id);

    game.dispatch({
      type: 'addCardTarget',
      payload: { playerId: 'p2', x: 0, y: 0 }
    });

    expect(errors[0]).toBeInstanceOf(NotActivePlayerError);
  });

  test('game should error gracefully if the target is invalid', () => {
    const { game, errors, helpers, player1 } = setup();
    helpers.skipMulligan();

    helpers.playGeneratedCardFromHand(player1, healingMystic.id);

    game.dispatch({
      type: 'addCardTarget',
      payload: { playerId: 'p1', x: 5, y: 5 }
    });
    expect(errors[0]).toBeInstanceOf(IllegalTargetError);
  });
});
