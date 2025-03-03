import { test, describe, expect } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_KINDS } from '../../src/card/card.enums';
import {
  IllegalTargetError,
  InvalidInteractionStateError,
  NotActivePlayerError,
  WrongGamePhaseError
} from '../../src/input/input-errors';
import { healingMystic } from '../../src/card/sets/core/neutral/healing-mystic';
import { INTERACTION_STATES } from '../../src/game/systems/interaction.system';

describe('Input: cancel play card', () => {
  const setup = () => {
    const cardPool = {
      'test-general': makeTestUnitCardBlueprint({
        id: 'test-general',
        faction: FACTIONS.F1,
        unitType: UNIT_KINDS.GENERAL
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

  test('a player cannot cancel card targeting during mulligan phase', () => {
    const { game, errors } = setup();

    game.dispatch({
      type: 'cancelPlayCard',
      payload: { playerId: 'p1' }
    });

    expect(errors[0]).toBeInstanceOf(WrongGamePhaseError);
  });

  test('a player cannot cancel card targeting when the game is not in select target interaction mode', () => {
    const { game, errors, helpers } = setup();
    helpers.skipMulligan();

    game.dispatch({
      type: 'cancelPlayCard',
      payload: { playerId: 'p1' }
    });

    expect(errors[0]).toBeInstanceOf(InvalidInteractionStateError);
  });

  test('a player cannot cancel card targeting when it is not their turn', () => {
    const { game, errors, helpers, player1 } = setup();
    helpers.skipMulligan();

    helpers.playGeneratedCardFromHand(player1, healingMystic.id);

    game.dispatch({
      type: 'cancelPlayCard',
      payload: { playerId: 'p2' }
    });

    expect(errors[0]).toBeInstanceOf(NotActivePlayerError);
  });

  test('canceling card targeting should put the interaction mode to idle', () => {
    const { game, helpers, player1 } = setup();
    helpers.skipMulligan();

    helpers.playGeneratedCardFromHand(player1, healingMystic.id);

    game.dispatch({
      type: 'cancelPlayCard',
      payload: { playerId: 'p1' }
    });
    expect(game.interaction.context.state).toBe(INTERACTION_STATES.IDLE);
  });
});
