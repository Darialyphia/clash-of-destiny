import type { BetterOmit } from '@game/shared';
import { System } from '../system';
import { Player, type PlayerOptions } from './player.entity';

export type PlayerSystemOptions = {
  players: Array<BetterOmit<PlayerOptions, 'isPlayer1'>>;
};

export class PlayerSystem extends System<PlayerSystemOptions> {
  private playerMap = new Map<string, Player>();

  initialize(options: PlayerSystemOptions): void {
    options.players.forEach((p, index) => {
      const player = new Player(this.game, { ...p, isPlayer1: index === 0 });
      this.playerMap.set(p.id, player);
    });
  }

  shutdown() {
    this.players.forEach(player => player.shutdown());
  }

  getPlayerById(id: string) {
    return this.playerMap.get(id);
  }

  get players() {
    return [...this.playerMap.values()];
  }

  get player1() {
    return this.players[0];
  }

  get player2() {
    return this.players[1];
  }
}
