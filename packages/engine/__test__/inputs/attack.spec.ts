import { test, describe, expect } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_TYPES } from '../../src/card/card.enums';
import {
  IllegalAttackTargetError,
  NotActivePlayerError,
  UnitNotOwnedError,
  WrongGamePhaseError
} from '../../src/input/input-errors';
import { healingMystic } from '../../src/card/sets/core/neutral/healing-mystic';
import { UNIT_EVENTS } from '../../src/unit/unit-enums';

describe('Input: attack', () => {
  const setup = () => {
    const cardPool = {
      'test-general': makeTestUnitCardBlueprint({
        id: 'test-general',
        faction: FACTIONS.F1,
        unitType: UNIT_TYPES.GENERAL,
        atk: 2,
        maxHp: 25
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

  test('a player cannot attack during mulligan phase', () => {
    const { game, errors, player1 } = setup();

    game.dispatch({
      type: 'attack',
      payload: { playerId: 'p1', unitId: player1.general.id, x: 0, y: 0 }
    });

    expect(errors[0]).toBeInstanceOf(WrongGamePhaseError);
  });

  test('a player cannot attack when it is not their turn', () => {
    const { game, errors, helpers, player2 } = setup();
    helpers.skipMulligan();

    game.dispatch({
      type: 'attack',
      payload: { playerId: 'p2', unitId: player2.general.id, x: 0, y: 0 }
    });

    expect(errors[0]).toBeInstanceOf(NotActivePlayerError);
  });

  test('a player cannot attack with a unit they do not control', () => {
    const { game, errors, helpers, player2 } = setup();
    helpers.skipMulligan();

    game.dispatch({
      type: 'attack',
      payload: { playerId: 'p1', unitId: player2.general.id, x: 0, y: 0 }
    });

    expect(errors[0]).toBeInstanceOf(UnitNotOwnedError);
  });

  test('a player cannot attack an empty tile', () => {
    const { game, errors, helpers, player1 } = setup();
    helpers.skipMulligan();

    game.dispatch({
      type: 'attack',
      payload: { playerId: 'p1', unitId: player1.general.id, x: 0, y: 0 }
    });

    expect(errors[0]).toBeInstanceOf(IllegalAttackTargetError);
  });

  test('a player cannot attack an unit that cannot be attacked', () => {
    const { game, errors, helpers, player1, player2 } = setup();
    helpers.skipMulligan();

    const newPosition = { x: player1.general.x + 1, y: player1.general.y };
    player2.general.teleport(newPosition);
    player2.general.addInterceptor('canBeAttackTarget', () => false);

    game.dispatch({
      type: 'attack',
      payload: { playerId: 'p1', unitId: player1.general.id, ...newPosition }
    });

    expect(errors[0]).toBeInstanceOf(IllegalAttackTargetError);
  });

  test('a valid target results in a successful attack', () => {
    const { game, helpers, player1, player2 } = setup();
    helpers.skipMulligan();

    const newPosition = { x: player1.general.x + 1, y: player1.general.y };
    player2.general.teleport(newPosition);

    game.dispatch({
      type: 'attack',
      payload: { playerId: 'p1', unitId: player1.general.id, ...newPosition }
    });
    expect(player2.general.hp).toBe(player2.general.maxHp - player1.general.atk);
  });

  test('a valid target results in a counterattack', () => {
    const { game, helpers, player1, player2 } = setup();
    helpers.skipMulligan();

    const newPosition = { x: player1.general.x + 1, y: player1.general.y };
    player2.general.teleport(newPosition);

    let hasCounterattacked = false;
    player2.general.once(UNIT_EVENTS.AFTER_COUNTERATTACK, () => {
      hasCounterattacked = true;
    });

    game.dispatch({
      type: 'attack',
      payload: { playerId: 'p1', unitId: player1.general.id, ...newPosition }
    });

    expect(hasCounterattacked).toBe(true);
  });
});
