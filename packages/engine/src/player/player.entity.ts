import { Entity } from '../entity';
import { type Game } from '../game/game';
import {
  assert,
  isDefined,
  type EmptyObject,
  type Nullable,
  type Point,
  type Serializable
} from '@game/shared';
import { type PlayerEventMap } from './player.events';
import type { Cell } from '../board/cell';
import { Unit } from '../unit/entities/unit.entity';
import type {
  AbilityBlueprint,
  ArtifactBlueprint,
  QuestBlueprint,
  UnitBlueprint
} from '../card/card-blueprint';
import type { UNIT_KINDS } from '../card/card.enums';
import { NoDeploymentError } from './player-errors';

export type PlayerOptions = {
  id: string;
  name: string;
  heroes: Array<{
    blueprintId: string;
    deck: { cards: string[] };
  }>;
};

export type SerializedPlayer = {
  id: string;
  entityType: 'player';
  name: string;
  deployZone: string[];
  heroes: string[];
};

type PlayerInterceptors = EmptyObject;
export class Player
  extends Entity<PlayerEventMap, PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  private game: Game;

  heroes: Array<{
    unit: Unit;
  }> = [];

  private heroesConfig: Array<{
    blueprintId: string;
    deck: { cards: string[] };
  }>;

  private deployMent: Nullable<Array<{ heroId: string } & Point>> = null;

  constructor(
    game: Game,
    private options: PlayerOptions
  ) {
    super(options.id, {});
    this.game = game;
    this.heroesConfig = options.heroes;
    this.forwardListeners();
  }

  serialize() {
    return {
      id: this.id,
      entityType: 'player' as const,
      name: this.options.name,
      deployZone: this.deployZone.map(c => c.id),
      heroes: this.heroes.map(h => h.unit.id)
    };
  }

  forwardListeners() {
    // Object.values(PLAYER_EVENTS).forEach(eventName => {
    //   this.on(eventName, event => {
    //     this.game.emit(
    //       `player.${eventName}`,
    //       new GamePlayerEvent({ player: this, event }) as any
    //     );
    //   });
    // });
  }

  initialize() {
    this.heroes = this.heroesConfig.map((hero, index) => {
      const classChain = this.makeClassChainFrom(hero.blueprintId);
      return {
        unit: this.game.unitSystem.addUnit(
          this,
          classChain,
          {
            cards: hero.deck.cards.map(blueprintId => ({
              id: this.game.cardIdFactory(blueprintId, this.id),
              blueprint: this.game.cardPool[blueprintId] as
                | AbilityBlueprint
                | QuestBlueprint
                | ArtifactBlueprint
            }))
          },
          this.deployZone[index]
        )
      };
    });
  }

  get opponent() {
    return this.game.playerSystem.players.find(p => !p.equals(this))!;
  }

  get isReadyToDeploy() {
    return isDefined(this.deployMent);
  }

  commitDeployment(deployment: Array<{ heroId: string } & Point>) {
    this.deployMent = deployment;
  }

  deploy() {
    assert(this.isReadyToDeploy, new NoDeploymentError());
    this.deployMent!.forEach(({ heroId, x, y }) => {
      const hero = this.heroes.find(h => h.unit.id === heroId)!.unit;
      hero.teleport({ x, y });
    });
  }

  makeClassChainFrom(blueprintId: string) {
    const blueprint = this.game.cardPool[blueprintId] as UnitBlueprint & {
      unitKind: typeof UNIT_KINDS.HERO;
    };
    if (!blueprint) {
      throw new Error(`Blueprint not found: ${blueprintId}`);
    }

    const classChain = [blueprint];
    let current = blueprint;
    while (current.previousClass) {
      current = this.game.cardPool[current.previousClass] as UnitBlueprint & {
        unitKind: typeof UNIT_KINDS.HERO;
      };
      classChain.unshift(current);
    }
    return classChain;
  }

  get deployZone(): Cell[] {
    return this.game.boardSystem.cells.filter(c => c.player?.equals(this));
  }

  get units() {
    return this.game.unitSystem.units.filter(u => u.player.equals(this));
  }

  get enemyUnits() {
    return this.game.unitSystem.units.filter(u => !u.player.equals(this));
  }

  get isPlayer1() {
    return this.game.playerSystem.players[0].equals(this);
  }
}
