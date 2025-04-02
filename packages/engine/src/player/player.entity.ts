import { Entity } from '../entity';
import { type Game } from '../game/game';
import { type EmptyObject, type Serializable } from '@game/shared';
import { type PlayerEventMap } from './player.events';
import { Unit } from '../unit/entities/unit.entity';
import { PLAYER_EVENTS } from './player-enums';
import { GamePlayerEvent } from '../game/game.events';

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
  heroes: string[];
  hasCommitedDeployment: boolean;
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

  private hasCommitedDeployment = false;

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
      heroes: this.heroes.map(h => h.unit.id),
      hasCommitedDeployment: this.hasCommitedDeployment
    };
  }

  forwardListeners() {
    Object.values(PLAYER_EVENTS).forEach(eventName => {
      this.on(eventName, event => {
        this.game.emit(
          `player.${eventName}`,
          new GamePlayerEvent({ player: this, event }) as any
        );
      });
    });
  }

  get opponent() {
    return this.game.playerSystem.players.find(p => !p.equals(this))!;
  }

  commitDeployment() {
    this.hasCommitedDeployment = true;
    if (this.game.playerSystem.players.every(p => p.hasCommitedDeployment)) {
      this.game.gamePhaseSystem.startBattle();
    }
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
