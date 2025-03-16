import { type BetterOmit, type Point } from '@game/shared';
import { System } from '../system';
import { GAME_PHASES } from '../game/systems/game-phase.system';
import { Interactable, type InteractableOptions } from './interactable.entity';
import { GAME_EVENTS } from '../game/game.events';

// eslint-disable-next-line @typescript-eslint/ban-types
export type InteractableSystemOptions = {};

export class InteractableSystem extends System<InteractableSystemOptions> {
  private interactableMap = new Map<string, Interactable>();

  private nextId = 0;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initialize() {
    this.game.on(GAME_EVENTS.TURN_START, () => {
      const candidates = this.game.boardSystem.cells.filter(
        cell => !cell.unit && !cell.interactable && cell.isWalkable
      );

      for (let i = 0; i < this.game.config.EXP_GLOBES_PER_TURN; i++) {
        const index = this.game.rngSystem.nextInt(candidates.length - 1);
        const cell = candidates.splice(index, 1)[0];
        this.add({ position: cell.position, blueprintId: 'incoming-experience-globe' });
        console.log('added incoming experience globe at', cell.position.serialize());
      }
    });
  }

  shutdown() {
    this.interactables.forEach(unit => unit.shutdown());
  }

  get interactables() {
    return [...this.interactableMap.values()];
  }

  getById(id: string) {
    return this.interactableMap.get(id) ?? null;
  }

  getAt(position: Point) {
    return (
      this.interactables.find(e => {
        return e.position.equals(position);
      }) ?? null
    );
  }

  getNearby({ x, y }: Point) {
    // prettier-ignore
    return [
      this.getAt({ x: x - 1, y: y - 1 }), // top left
      this.getAt({ x: x    , y: y - 1 }), // top
      this.getAt({ x: x + 1, y: y - 1 }), // top right
      this.getAt({ x: x - 1, y: y     }),  // left
      this.getAt({ x: x + 1, y: y     }),  // right
      this.getAt({ x: x - 1, y: y + 1 }), // bottom left
      this.getAt({ x: x    , y: y + 1 }), // bottom
      this.getAt({ x: x + 1, y: y + 1 }), // bottom right,
    ].filter
  }

  add(options: BetterOmit<InteractableOptions, 'id'>) {
    const id = `interactable_${++this.nextId}`;
    const unit = new Interactable(this.game, { id, ...options });
    this.interactableMap.set(unit.id, unit);

    if (this.game.phase === GAME_PHASES.BATTLE) {
      // this.game.turnSystem.insertInCurrentQueue(unit);
    }
    return unit;
  }

  remove(interactable: Interactable) {
    this.interactableMap.delete(interactable.id);
  }
}
