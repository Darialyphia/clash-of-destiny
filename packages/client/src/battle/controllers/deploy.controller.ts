import type { CellViewModel } from '@/board/cell.model';
import type { HighlightTag, UiController } from './ui-controller';
import type { UnitViewModel } from '@/unit/unit.model';
import type { Nullable, Point } from '@game/shared';
import type { Ref } from 'vue';
import type { PlayerViewModel } from '@/player/player.model';
import type { GameState } from '../stores/battle.store';

export type DeployControllerOptions = {
  selectedUnit: Ref<Nullable<UnitViewModel>>;
  selectUnit: (unit: UnitViewModel) => void;
  unselectUnit: () => void;
  player: Ref<PlayerViewModel>;
  gameState: Ref<GameState>;
};

export class DeployController implements UiController {
  constructor(private options: DeployControllerOptions) {}

  private moveUnit(unit: UnitViewModel, cell: CellViewModel) {
    unit.isAnimating = true;
    const currentCell = unit.getCell();

    return gsap.to(unit.position, {
      x: cell.position.x,
      y: cell.position.y,
      duration: 0.35,
      ease: Power2.easeInOut,
      onComplete: () => {
        currentCell.removeUnit();
        cell.addUnit(unit);
        unit.isAnimating = false;
      }
    });
  }

  private async swapUnits(unit1: UnitViewModel, unit2: UnitViewModel) {
    const cell1 = unit1.getCell();
    const cell2 = unit2.getCell();

    unit1.isAnimating = true;
    unit2.isAnimating = true;

    await Promise.all([
      gsap.to(unit1.position, {
        x: cell2.position.x,
        y: cell2.position.y,
        duration: 0.35,
        ease: Power2.easeInOut,
        onComplete: () => {
          cell1.addUnit(unit2);
          unit1.isAnimating = false;
        }
      }),

      gsap.to(unit2.position, {
        x: cell1.position.x,
        y: cell1.position.y,
        duration: 0.35,
        ease: Power2.easeInOut,
        onComplete: () => {
          cell2.addUnit(unit1);
          unit2.isAnimating = false;
        }
      })
    ]);
  }

  private async deployUnit(unit: UnitViewModel, cell: CellViewModel) {
    const cellUnit = cell.getUnit();

    if (cellUnit) {
      await this.swapUnits(unit, cellUnit);
    } else {
      await this.moveUnit(unit, cell);
    }

    unit.deploy();
  }

  private canDeployAt(cell: CellViewModel): boolean {
    const { player } = this.options;
    return player.value.getDeployZone().some(zoneCell => zoneCell.equals(cell));
  }

  onCellClick(cell: CellViewModel): void {
    const { selectedUnit, selectUnit, unselectUnit, player } = this.options;

    if (selectedUnit.value) {
      if (this.canDeployAt(cell)) {
        this.deployUnit(selectedUnit.value, cell);
      }
      unselectUnit();
    } else {
      const unit = cell.getUnit();
      const canSelect = unit && unit.getPlayer()?.equals(player.value);
      if (canSelect) {
        selectUnit(unit);
      }
    }
  }

  getCellHighlightTag(cell: CellViewModel): HighlightTag | null {
    if (this.options.player.value.getDeployZone().some(c => c.equals(cell))) {
      return 'movement';
    }

    return null;
  }
}
