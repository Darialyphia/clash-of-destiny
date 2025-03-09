import { Entity } from '../entity';
import { type Game } from '../game/game';
import { type EmptyObject, type Serializable } from '@game/shared';
import { type PlayerEventMap } from './player.events';
import type { Cell, SerializedCell } from '../board/cell';
import { Unit } from '../unit/entities/unit.entity';
import type {
  AbilityBlueprint,
  ArtifactBlueprint,
  QuestBlueprint,
  UnitBlueprint
} from '../card/card-blueprint';
import type { UNIT_KINDS } from '../card/card.enums';

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
  name: string;
  deployZone: SerializedCell[];
};

type PlayerInterceptors = EmptyObject;
export class Player
  extends Entity<PlayerEventMap, PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  private game: Game;

  private heroes: Array<{
    unit: Unit;
  }>;

  constructor(
    game: Game,
    private options: PlayerOptions
  ) {
    super(options.id, {});
    this.game = game;
    this.heroes = options.heroes.map((hero, index) => {
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
    this.forwardListeners();
  }

  serialize() {
    return {
      id: this.id,
      name: this.options.name,
      deployZone: this.deployZone.map(c => c.serialize())
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

  get opponent() {
    return this.game.playerSystem.players.find(p => !p.equals(this))!;
  }

  // generateCard<T extends CardBlueprint = CardBlueprint>(blueprintId: string) {
  //   const blueprint = this.game.cardPool[blueprintId] as T;
  //   const card = this.game.cardFactory<T>(this.game, this, {
  //     id: this.game.cardIdFactory(blueprint.id, this.id),
  //     blueprint: blueprint
  //   });

  //   return card;
  // }

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
