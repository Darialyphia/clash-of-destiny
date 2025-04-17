import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { Modifier } from '../modifier.entity';

export class DazzlingBloomModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard, initialStacks: number) {
    super('dazzling-bloom', game, source, {
      stackable: true,
      initialStacks,
      name: 'Dazzling Bloom',
      description: '',
      icon: 'keyword-dazzling-bloom',
      mixins: []
    });
  }
}
