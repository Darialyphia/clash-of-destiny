import type { CellViewModel } from '@/board/cell.model';
import type { UiController } from './ui-controller';

export class EndGameController implements UiController {
  onCellClick(cell: CellViewModel): void {
    console.log('EndGameController.onCellClick', cell);
  }
}
