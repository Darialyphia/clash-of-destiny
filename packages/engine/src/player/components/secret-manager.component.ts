import type { SecretCard } from '../../card/entities/secret-card.entity';
import type { Game } from '../../game/game';
import type { Player } from '../player.entity';

export type Secret = {
  card: SecretCard;
};
export class SecretManagerComponent {
  private secrets: Map<string, Secret> = new Map();

  constructor(
    private game: Game,
    private player: Player
  ) {}

  add(key: string, secret: Secret) {
    this.secrets.set(key, secret);
  }

  getAll() {
    return Array.from(this.secrets.values());
  }

  get(key: string) {
    return this.secrets.get(key);
  }

  delete(key: string) {
    this.secrets.delete(key);
  }

  trigger(key: string, cb: () => void) {
    if (this.game.gamePhaseSystem.turnPlayer.equals(this.player)) {
      return;
    }

    const secret = this.get(key);
    if (secret) {
      cb();
      this.secrets.delete(key);
      this.player.cards.sendToDiscardPile(secret.card);
    }
  }

  serialize() {
    return Array.from(this.secrets.keys());
  }
}
