import { Entity } from '../entity';
import { type Game } from '../game/game';
import { type EmptyObject, type Point, type Serializable } from '@game/shared';
import { type PlayerEventMap } from './player.events';

export type PlayerOptions = {
  id: string;
  name: string;
  heroes: Array<{
    blueprintId: string;
    deck: { cards: string[] };
  }>;
  generalPosition: Point;
  isPlayer1: boolean;
};

export type SerializedPlayer = {
  id: string;
  name: string;
};

type PlayerInterceptors = EmptyObject;
export class Player
  extends Entity<PlayerEventMap, PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  private game: Game;

  readonly isPlayer1: boolean;
  constructor(
    game: Game,
    private options: PlayerOptions
  ) {
    super(options.id, {});
    this.game = game;
    this.isPlayer1 = options.isPlayer1;

    this.forwardListeners();
  }

  serialize() {
    return {
      id: this.id,
      name: this.options.name
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

  get units() {
    return this.game.unitSystem.units.filter(u => u.player.equals(this));
  }

  get enemyUnits() {
    return this.game.unitSystem.units.filter(u => !u.player.equals(this));
  }
}
