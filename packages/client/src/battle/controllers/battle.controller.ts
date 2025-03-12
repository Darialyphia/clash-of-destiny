import type { CellViewModel } from '@/board/cell.model';
import type { UiController } from './ui-controller';
import type { UnitViewModel } from '@/unit/unit.model';
import type { Nullable } from '@game/shared';
import type { Ref } from 'vue';
import { pointToCellId } from '@game/engine/src/board/board-utils';

export type BattleControllerOptions = {
  selectedUnit: Ref<Nullable<UnitViewModel>>;
  activeUnit: Ref<UnitViewModel>;
};
export class BattleController implements UiController {
  constructor(private options: BattleControllerOptions) {}

  get activeUnit() {
    return this.options.activeUnit.value;
  }

  onCellClick(cell: CellViewModel): void {
    if (this.activeUnit.moveIntent) {
      if (pointToCellId(this.activeUnit.moveIntent.point) === cell.id) {
        this.activeUnit.commitMove();
        return;
      }
    }

    if (this.activeUnit.canMoveTo(cell)) {
      this.activeUnit.moveTowards({ x: cell.position.x, y: cell.position.y });
      return;
    }

    if (this.activeUnit.canAttackAt(cell)) {
      this.activeUnit.attackAt(cell);
      return;
    }
  }
}
