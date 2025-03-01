import { assert, isDefined, type Point } from '@game/shared';
import { Game, type GameOptions, type GameOptionsPlayer } from '../src/game/game';
import {
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  UNIT_TYPES,
  type UnitType
} from '../src/card/card.enums';
import type { Faction } from '../src/card/entities/faction.entity';
import { GAME_EVENTS } from '../src/game/game.events';
import type { UnitBlueprint } from '../src/card/card-blueprint';
import { UnitSummonTargetingtrategy } from '../src/targeting/unit-summon-targeting.strategy';
import { PointAOEShape } from '../src/aoe/point.aoe-shape';
import type { Player } from '../src/player/player.entity';

export const testGameBuilder = () => {
  const options: Partial<GameOptions> = {};

  return {
    withSeed(seed: string) {
      options.rngSeed = seed;
      return this;
    },
    withOverrides(overrides: GameOptions['overrides']) {
      options.overrides = overrides;
      return this;
    },
    withP1Deck(deck: GameOptionsPlayer['deck']) {
      // @ts-expect-error
      options.players ??= [];
      // @ts-expect-error
      options.players[0] = {
        deck,
        id: 'p1',
        name: 'player1'
      };
      return this;
    },
    withP2Deck(deck: GameOptionsPlayer['deck']) {
      // @ts-expect-error
      options.players ??= [];
      // @ts-expect-error
      options.players[1] = {
        deck,
        id: 'p2',
        name: 'player2'
      };
      return this;
    },
    build() {
      const { players, overrides } = options;
      assert(isDefined(players), 'players must be defined');
      assert(players.length === 2, 'players must have 2 entries');
      const game = new Game({
        id: 'test',
        overrides: overrides ?? {},
        rngSeed: options.rngSeed ?? 'test',
        players,
        mapId: '1v1'
      });

      game.initialize();

      const errors: Error[] = [];

      game.on(GAME_EVENTS.ERROR, event => {
        errors.push(event.data.error);
      });

      return {
        game,
        errors,
        player1: game.playerSystem.player1,
        player2: game.playerSystem.player2,
        helpers: {
          skipMulligan: () => {
            game.dispatch({
              type: 'mulligan',
              payload: { indices: [], playerId: game.playerSystem.player1.id }
            });
            game.dispatch({
              type: 'mulligan',
              payload: { indices: [], playerId: game.playerSystem.player2.id }
            });
          },
          playGeneratedCardFromHand: (
            player: Player,
            blueprintId: string,
            target?: Point
          ) => {
            player.gainMana(game.cardPool[blueprintId].manaCost);
            const card = player.generateCard(blueprintId);
            player.addToHand(card);
            player.playCardFromHand(card);

            if (target) {
              game.interaction.addTarget({
                type: 'cell',
                cell: target
              });
            }
            return card;
          }
        }
      };
    }
  };
};

export const makeTestUnitCardBlueprint = ({
  id,
  faction,
  atk = 1,
  manaCost = 1,
  maxHp = 1,
  abilities = [],
  unitType = UNIT_TYPES.MINION,
  followup = {
    getTargets(game, card) {
      return [
        {
          type: 'cell',
          isElligible(point) {
            return new UnitSummonTargetingtrategy(game, card).canTargetAt(point);
          }
        }
      ];
    },
    canCommit() {
      return true;
    }
  },
  getAoe = (game, card) => {
    return new PointAOEShape(game, card.player);
  },
  onPlay = () => {},
  onInit = () => {}
}: {
  id: string;
  faction: Faction;
  maxHp?: number;
  atk?: number;
  manaCost?: number;
  job?: string;
  abilities?: UnitBlueprint['abilities'];
  followup?: UnitBlueprint['followup'];
  unitType?: UnitType;
  getAoe?: UnitBlueprint['getAoe'];
  onPlay?: UnitBlueprint['onPlay'];
  onInit?: UnitBlueprint['onInit'];
}): UnitBlueprint => ({
  id,
  faction,
  atk,
  maxHp,
  manaCost,
  onPlay,
  onInit,
  abilities,
  keywords: [],
  name: 'Test Creature',
  kind: CARD_KINDS.UNIT,
  description: 'Test Creature Description',
  rarity: RARITIES.COMMON,
  setId: CARD_SETS.CORE,
  followup,
  getAoe,
  unitType
});
