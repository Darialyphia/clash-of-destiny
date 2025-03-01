import { test, describe, expect } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_TYPES } from '../../src/card/card.enums';
import type { UnitCard } from '../../src/card/entities/unit-card.entity';
import { KEYWORDS } from '../../src/card/card-keyword';
import { CelerityModifier } from '../../src/modifier/modifiers/celerity.modifier';
import { IllegalAttackTargetError } from '../../src/input/input-errors';

describe('Modifier: Celerity', () => {
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
        maxHp: 3,
        onPlay(game, card) {
          card.unit.addModifier(new CelerityModifier(game, card));
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

  test('A unit with celerity should have the Celerity Keyword', () => {
    const { cardPool, player1, helpers } = setup();

    const card = helpers.playGeneratedCardFromHand(player1, cardPool['test-minion'].id, {
      x: player1.general.x + 1,
      y: player1.general.y
    }) as UnitCard;

    expect(card.unit.keywords).toContain(KEYWORDS.CELERITY);
  });

  test('A unit with celerity can move twice', () => {
    const { cardPool, player1, helpers, game, errors } = setup();

    const card = helpers.playGeneratedCardFromHand(player1, cardPool['test-minion'].id, {
      x: player1.general.x + 1,
      y: player1.general.y
    }) as UnitCard;

    card.unit.activate();
    game.dispatch({
      type: 'move',
      payload: {
        playerId: 'p1',
        unitId: card.unit.id,
        x: card.unit.x + 2,
        y: card.unit.y
      }
    });

    game.dispatch({
      type: 'move',
      payload: {
        playerId: 'p1',
        unitId: card.unit.id,
        x: card.unit.x + 2,
        y: card.unit.y
      }
    });

    expect(errors.length).toBe(0);
    expect(card.unit.x).toBe(player1.general.x + 5);
  });

  test('A unit with celerity can attack twice', () => {
    const { cardPool, player1, player2, helpers, game, errors } = setup();

    const card = helpers.playGeneratedCardFromHand(player1, cardPool['test-minion'].id, {
      x: player1.general.x + 1,
      y: player1.general.y
    }) as UnitCard;

    card.unit.activate();
    card.unit.teleport({ x: player2.general.x - 1, y: player1.general.y });

    game.dispatch({
      type: 'attack',
      payload: {
        playerId: 'p1',
        unitId: card.unit.id,
        x: player2.general.x,
        y: player2.general.y
      }
    });
    game.dispatch({
      type: 'attack',
      payload: {
        playerId: 'p1',
        unitId: card.unit.id,
        x: player2.general.x,
        y: player2.general.y
      }
    });

    expect(errors.length).toBe(0);
  });

  test('A unit with celerity cannot move twice in a row then attack twice', () => {
    const { cardPool, player1, player2, helpers, game, errors } = setup();

    const card = helpers.playGeneratedCardFromHand(player1, cardPool['test-minion'].id, {
      x: player1.general.x + 1,
      y: player1.general.y
    }) as UnitCard;

    card.unit.activate();
    game.dispatch({
      type: 'move',
      payload: {
        playerId: 'p1',
        unitId: card.unit.id,
        x: card.unit.x + 2,
        y: card.unit.y
      }
    });

    game.dispatch({
      type: 'move',
      payload: {
        playerId: 'p1',
        unitId: card.unit.id,
        x: card.unit.x + 2,
        y: card.unit.y
      }
    });

    player2.general.teleport({ x: card.unit.x + 1, y: card.unit.y });

    game.dispatch({
      type: 'attack',
      payload: {
        playerId: 'p1',
        unitId: card.unit.id,
        x: player2.general.x,
        y: player2.general.y
      }
    });
    game.dispatch({
      type: 'attack',
      payload: {
        playerId: 'p1',
        unitId: card.unit.id,
        x: player2.general.x,
        y: player2.general.y
      }
    });

    expect(errors[0]).toBeInstanceOf(IllegalAttackTargetError);
  });
});
