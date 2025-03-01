import { test, describe, expect } from 'vitest';
import { makeTestUnitCardBlueprint, testGameBuilder } from '../test-utils';
import { FACTIONS, UNIT_TYPES } from '../../src/card/card.enums';
import type { UnitCard } from '../../src/card/entities/unit-card.entity';
import { KEYWORDS } from '../../src/card/card-keyword';
import { BlastModifier } from '../../src/modifier/modifiers/blast.modiier';
import { IllegalAttackTargetError } from '../../src/input/input-errors';
import { AnywhereTargetingStrategy } from '../../src/targeting/anywhere-targeting-strategy';

describe('Modifier: Blast', () => {
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
        maxHp: 5,
        onPlay(game, card) {
          card.unit.addModifier(new BlastModifier(game, card));
        }
      }),
      'test-regular-minion': makeTestUnitCardBlueprint({
        id: 'test-regular-minion',
        faction: FACTIONS.F1,
        atk: 1,
        maxHp: 5
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

    const attackEnemy = (unitId: string) => {
      const card = game.helpers.playGeneratedCardFromHand(
        game.player1,
        cardPool['test-minion'].id
      ) as UnitCard;
      game.game.interaction.addTarget({
        type: 'cell',
        cell: { x: game.player1.general.x + 1, y: game.player1.general.y }
      });

      const target = game.game.unitSystem.getUnitById(unitId)!;
      card.unit.activate();
      card.unit.teleport({ x: target.x - 1, y: target.y });

      card.unit.attack(target);

      return card.unit;
    };

    const blastHorizontally = (unitId: string) => {
      const card = game.helpers.playGeneratedCardFromHand(
        game.player1,
        cardPool['test-minion'].id
      ) as UnitCard;
      game.game.interaction.addTarget({
        type: 'cell',
        cell: { x: game.player1.general.x + 1, y: game.player1.general.y }
      });

      // move away the general so that the unit can teleport
      game.player1.general.teleport({
        x: game.player1.general.x + 1,
        y: game.player1.general.y
      });

      const target = game.game.unitSystem.getUnitById(unitId)!;
      card.unit.activate();
      card.unit.teleport({ x: 0, y: target.y });

      card.unit.attack(target);

      return card.unit;
    };

    const blastVertically = (unitId: string) => {
      const card = game.helpers.playGeneratedCardFromHand(
        game.player1,
        cardPool['test-minion'].id
      ) as UnitCard;
      game.game.interaction.addTarget({
        type: 'cell',
        cell: { x: game.player1.general.x + 1, y: game.player1.general.y }
      });

      const target = game.game.unitSystem.getUnitById(unitId)!;
      card.unit.activate();
      card.unit.teleport({ x: target.x, y: 0 });

      card.unit.attack(target);

      return card.unit;
    };

    return {
      ...game,
      cardPool,
      attackEnemy,
      blastHorizontally,
      blastVertically
    };
  };

  test('a unit with blast should have the Blast Keyword', () => {
    const { cardPool, player1, helpers } = setup();

    const card = helpers.playGeneratedCardFromHand(player1, cardPool['test-minion'].id, {
      x: player1.general.x + 1,
      y: player1.general.y
    }) as UnitCard;

    expect(card.unit.keywords).toContain(KEYWORDS.BLAST);
  });

  test('a unit with blast can attack from range if the target is horizontally aligned', () => {
    const { player2, blastHorizontally, errors } = setup();

    const unit = blastHorizontally(player2.general.id);

    expect(errors.length).toBe(0);
    expect(player2.general.hp).toBe(player2.general.maxHp - unit.atk);
  });

  test('a unit with blast can attack from range if the target is verticaly aligned', () => {
    const { player2, blastVertically, errors } = setup();

    const unit = blastVertically(player2.general.id);

    expect(errors.length).toBe(0);
    expect(player2.general.hp).toBe(player2.general.maxHp - unit.atk);
  });

  test('a blast attack damages all enemies on the same line', () => {
    const { player2, helpers, blastHorizontally, cardPool } = setup();

    const enemy1 = helpers.playGeneratedCardFromHand(
      player2,
      cardPool['test-minion'].id,
      {
        x: player2.general.x - 1,
        y: player2.general.y
      }
    ) as UnitCard;
    const enemy2 = helpers.playGeneratedCardFromHand(
      player2,
      cardPool['test-minion'].id,
      {
        x: player2.general.x - 2,
        y: player2.general.y
      }
    ) as UnitCard;
    const unit = blastHorizontally(enemy1.unit.id);

    expect(enemy1.unit.hp).toBe(enemy1.unit.maxHp - unit.atk);
    expect(enemy2.unit.hp).toBe(enemy2.unit.maxHp - unit.atk);
    expect(player2.general.hp).toBe(player2.general.maxHp - unit.atk);
  });

  test("a unit with blast cannot blast a unit that isn't axis aligned", () => {
    const { game, player1, player2, helpers, cardPool, errors } = setup();

    const card = helpers.playGeneratedCardFromHand(player1, cardPool['test-minion'].id, {
      x: player1.general.x + 1,
      y: player1.general.y
    }) as UnitCard;

    const enemy = helpers.playGeneratedCardFromHand(player2, cardPool['test-minion'].id, {
      x: player2.general.x - 1,
      y: player2.general.y
    }) as UnitCard;

    enemy.unit.teleport({ x: card.unit.x + 2, y: card.unit.y + 2 });
    card.unit.activate();

    game.dispatch({
      type: 'attack',
      payload: {
        playerId: 'p1',
        unitId: card.unit.id,
        x: enemy.unit.x,
        y: enemy.unit.y
      }
    });

    expect(errors[0]).toBeInstanceOf(IllegalAttackTargetError);
  });

  test('a unit with blast will only damage the attack target when attacking diagonally', () => {
    const { game, player1, player2, helpers, cardPool } = setup();

    const card = helpers.playGeneratedCardFromHand(player1, cardPool['test-minion'].id, {
      x: player1.general.x + 1,
      y: player1.general.y
    }) as UnitCard;
    card.unit.activate();

    // make a diagonal with 2 enemies
    const enemy = helpers.playGeneratedCardFromHand(player2, cardPool['test-minion'].id, {
      x: player2.general.x - 1,
      y: player2.general.y
    }) as UnitCard;
    enemy.unit.teleport({ x: card.unit.x + 1, y: card.unit.y + 1 });
    player2.general.teleport({ x: card.unit.x + 2, y: card.unit.y + 2 });

    game.dispatch({
      type: 'attack',
      payload: {
        playerId: 'p1',
        unitId: card.unit.id,
        x: enemy.unit.x,
        y: enemy.unit.y
      }
    });

    expect(enemy.unit.isFullHp).toBe(false);
    expect(player2.general.isFullHp).toBe(true);
  });

  test('all enemies hit by a blast attack should retaliate if able', () => {
    const { game, player2, helpers, blastHorizontally, cardPool } = setup();

    const enemy1 = helpers.playGeneratedCardFromHand(
      player2,
      cardPool['test-regular-minion'].id,
      {
        x: player2.general.x - 1,
        y: player2.general.y
      }
    ) as UnitCard;
    const enemy2 = helpers.playGeneratedCardFromHand(
      player2,
      cardPool['test-regular-minion'].id,
      {
        x: player2.general.x - 2,
        y: player2.general.y
      }
    ) as UnitCard;

    // make it so that enemies can counterattack
    enemy1.unit.addInterceptor(
      'counterattackTargetingPattern',
      () =>
        new AnywhereTargetingStrategy(
          game,
          enemy1.player,
          enemy1.unit.counterattackTargetType
        )
    );
    enemy2.unit.addInterceptor(
      'counterattackTargetingPattern',
      () =>
        new AnywhereTargetingStrategy(
          game,
          enemy2.player,
          enemy2.unit.counterattackTargetType
        )
    );
    const unit = blastHorizontally(player2.general.id);

    expect(enemy1.unit.hp).toBe(enemy1.unit.maxHp - unit.atk);
    expect(enemy2.unit.hp).toBe(enemy2.unit.maxHp - unit.atk);
    expect(player2.general.hp).toBe(player2.general.maxHp - unit.atk);
    expect(unit.hp).toBe(unit.maxHp - enemy1.unit.atk - enemy2.unit.atk);
  });
});
