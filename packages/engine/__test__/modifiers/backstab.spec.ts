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

describe('Modifier: Backstab', () => {
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
          card.unit.addModifier(new BackstabModifier(game, card, 1));
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

    const backstabAttackPlayer2General = () => {
      const card = game.helpers.playGeneratedCardFromHand(
        game.player1,
        cardPool['test-minion'].id
      ) as UnitCard;
      game.game.interaction.addTarget({
        type: 'cell',
        cell: { x: game.player1.general.x + 1, y: game.player1.general.y }
      });

      game.player2.general.teleport({
        x: game.player2.general.x - 1,
        y: game.player2.general.y
      });
      card.unit.teleport({ x: game.player2.general.x + 1, y: game.player2.general.y });

      card.unit.attack(game.player2.general);

      return card.unit;
    };

    const regularAttackPlayer2General = () => {
      const card = game.helpers.playGeneratedCardFromHand(
        game.player1,
        cardPool['test-minion'].id
      ) as UnitCard;
      game.game.interaction.addTarget({
        type: 'cell',
        cell: { x: game.player1.general.x + 1, y: game.player1.general.y }
      });

      game.player2.general.teleport({
        x: game.player2.general.x - 1,
        y: game.player2.general.y
      });
      card.unit.teleport({ x: game.player2.general.x - 1, y: game.player2.general.y });

      card.unit.attack(game.player2.general);

      return card.unit;
    };

    return {
      ...game,
      cardPool,
      backstabAttackPlayer2General,
      regularAttackPlayer2General
    };
  };

  test('A unit with backstab should have the Backstab Keyword', () => {
    const { cardPool, player1, helpers, game } = setup();

    const card = helpers.playGeneratedCardFromHand(
      player1,
      cardPool['test-minion'].id
    ) as UnitCard;

    game.interaction.addTarget({
      type: 'cell',
      cell: { x: player1.general.x + 1, y: player1.general.y }
    });

    expect(card.unit.keywords).toContain(KEYWORDS.BACKSTAB);
  });

  test('A backstab attack should do bonus damage', () => {
    const { player1, player2, backstabAttackPlayer2General } = setup();

    const backstaber = backstabAttackPlayer2General();
    const modifier = backstaber.getModifier(BackstabModifier)!;

    expect(player2.general.hp).toBe(
      player1.general.maxHp - (backstaber.atk + modifier.backstabAmount)
    );
  });

  test('A backstab attack should not trigger a counterattack', () => {
    const { game, backstabAttackPlayer2General } = setup();

    let hasCounterattacked = false;
    game.once(GAME_EVENTS.UNIT_AFTER_COUNTERATTACK, () => {
      hasCounterattacked = true;
    });

    backstabAttackPlayer2General();

    expect(hasCounterattacked).toBe(false);
  });

  test('A backstab attack should emit a custom modifier event', () => {
    const { game, backstabAttackPlayer2General } = setup();

    let count = 0;
    game.on(GAME_EVENTS.MODIFIER_EVENT, e => {
      if (e.data.eventName === BACKSTAB_EVENTS.BACKSTAB) {
        count++;
      }
    });

    backstabAttackPlayer2General();

    expect(count).toBe(1);
  });

  test('A backstab should not happen when not attacking from behind', () => {
    const { game, regularAttackPlayer2General } = setup();

    let hasCounterattacked = false;
    game.once(GAME_EVENTS.UNIT_AFTER_COUNTERATTACK, () => {
      hasCounterattacked = true;
    });

    regularAttackPlayer2General();
    expect(hasCounterattacked).toBe(true);
  });
});
