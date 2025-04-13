import type { Point } from '@game/shared';
import type { SecretCard } from '../../card/entities/secret-card.entity';
import type { Game } from '../../game/game';
import type { Player } from '../player.entity';

export type Secret = {
  card: SecretCard;
  targets: Point[];
  cleanup: () => void;
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

  get(key: string) {
    return this.secrets.get(key);
  }

  delete(key: string) {
    this.secrets.delete(key);
  }

  trigger(key: string) {
    if (this.game.gamePhaseSystem.turnPlayer.equals(this.player)) {
      return;
    }

    const secret = this.get(key);
    if (secret) {
      const aoeShape = secret.card.blueprint.getAoe(
        this.game,
        secret.card,
        secret.targets
      );
      secret.card.blueprint.onTrigger(
        this.game,
        secret.card,
        aoeShape.getCells(secret.targets),
        aoeShape.getUnits(secret.targets)
      );
      this.secrets.delete(key);
      this.player.cards.sendToDiscardPile(secret.card);
      secret.cleanup();
    }
  }
}
